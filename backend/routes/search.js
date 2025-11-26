import express from "express";
import { Client } from "@opensearch-project/opensearch";
import { OPENSEARCH_HOST, INDEX_NAME } from "../config.js";

const router = express.Router();

const client = new Client({ node: OPENSEARCH_HOST });

// Search endpoint
router.get("/", async (req, res) => {
  const query = req.query.q?.trim();
  const limitParam = parseInt(req.query.limit, 10);
  const pageParam = parseInt(req.query.page, 10);
  const limit = Number.isFinite(limitParam) ? Math.max(limitParam, 5) : 5;
  const page = Number.isFinite(pageParam) ? Math.max(pageParam, 1) : 1;
  const from = (page - 1) * limit;

  if (!query) return res.status(400).json({ error: "Missing search query" });

  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        from,
        size: limit,
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query,
                  fields: ["title^8", "tags^4", "body^2"],
                  type: "best_fields",
                  operator: "and",
                },
              },
              {
                multi_match: {
                  query,
                  fields: ["title^6", "tags^3", "body"],
                  fuzziness: "AUTO",
                  operator: "or",
                },
              },
            ],
            minimum_should_match: 1,
          },
        },

        highlight: {
          fields: {
            title: { number_of_fragments: 0 },
            body: { fragment_size: 200, number_of_fragments: 1 },
            tags: { number_of_fragments: 3 },
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"],
        },
      },
    });

    const hits = response.body.hits;
    const total = hits.total?.value ?? 0;
    const formatted = hits.hits.map((hit) => {
      const source = hit._source || {};
      const highlight = hit.highlight || {};
      const snippetFallback = source.body
        ? `${source.body.substring(0, 200)}...`
        : "";

      return {
        id: hit._id,
        score: hit._score,
        title: highlight.title?.[0] || source.title,
        snippet: highlight.body?.[0] || highlight.tags?.[0] || snippetFallback,
        tags: source.tags,
        category: source.category,
        source: source.source,
        year: source.year,
        highlight: {
          title: highlight.title?.[0] || null,
          snippet: highlight.body?.[0] || highlight.tags?.[0] || null,
          tags: highlight.tags || [],
        },
      };
    });

    res.json({
      results: formatted,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get Document by ID
router.get("/:id", async (req, res) => {
  const query = req.query.q?.trim();
  console.log(query);
  console.log(req.params.id);

  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        size: 1,
        query: {
          bool: {
            filter: [{ term: { _id: req.params.id } }],
            ...(query
              ? {
                  must: {
                    multi_match: {
                      query,
                      fields: ["title^8", "tags^4", "body^2"],
                      type: "best_fields",
                      operator: "and",
                      fuzziness: "AUTO",
                    },
                  },
                  should: [
                    {
                      multi_match: {
                        query,
                        fields: ["title^10", "tags^5"],
                        type: "phrase",
                        slop: 2,
                        boost: 2,
                      },
                    },
                  ],
                }
              : {}),
          },
        },
        highlight: {
          require_field_match: !!query,
          fields: {
            title: { number_of_fragments: 0 },
            body: { number_of_fragments: 0 },
            tags: { number_of_fragments: 5 },
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"],
        },
      },
    });

    const hit = response.body.hits.hits[0];

    if (!hit) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({
      data: hit._source,
      highlight: {
        title: hit.highlight?.title?.[0] || null,
        body: hit.highlight?.body?.[0] || null,
        tags: hit.highlight?.tags || [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load document" });
  }
});

export default router;
