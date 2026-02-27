import React, { Component } from "react";
import Newitem from "./Newitem";
import Navbar from "./Navbar";
import fallbackNews from "../data/fallbackNews.json";

const API_KEY = "pub_0b7f5eea66af4710a99a93ab234f7341";
const NEWSDATA_API_URL = "https://newsdata.io/api/1/latest";
const DEFAULT_QUERY = "all country news";
const PAGE_SIZE = 20;
const COUNTRY_CODES = [
  "us",
  "in",
  "gb",
  "au",
  "ca",
  "de",
  "fr",
  "it",
  "jp",
  "kr",
  "cn",
  "ru",
  "br",
  "mx",
  "id",
  "za",
  "ae",
  "sa",
  "tr",
  "ng",
  "pk",
];

const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;
const getCountryLabel = (countryCode) =>
  regionNames?.of(countryCode.toUpperCase()) || countryCode.toUpperCase();
const COUNTRY_OPTIONS = COUNTRY_CODES.map((code) => ({
  code,
  label: getCountryLabel(code),
}));

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "this",
  "that",
  "these",
  "those",
  "about",
  "all",
  "latest",
  "news",
]);

const tokenize = (value = "") =>
  value
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

const tokenizeText = (value = "") =>
  value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const normalizeToken = (token = "") => {
  const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanToken) return "";

  if (cleanToken.length > 4 && cleanToken.endsWith("ies")) {
    return `${cleanToken.slice(0, -3)}y`;
  }
  if (cleanToken.length > 5 && cleanToken.endsWith("ing")) {
    return cleanToken.slice(0, -3);
  }
  if (cleanToken.length > 4 && cleanToken.endsWith("ed")) {
    return cleanToken.slice(0, -2);
  }
  if (cleanToken.length > 4 && cleanToken.endsWith("es")) {
    return cleanToken.slice(0, -2);
  }
  if (cleanToken.length > 3 && cleanToken.endsWith("s")) {
    return cleanToken.slice(0, -1);
  }
  return cleanToken;
};

const getWordVariants = (token) => {
  const normalized = normalizeToken(token);
  if (!normalized) return [];

  const variants = new Set([normalized]);
  if (normalized.length > 3) {
    variants.add(`${normalized}s`);
  }
  if (normalized.length > 3 && normalized.endsWith("y")) {
    variants.add(`${normalized.slice(0, -1)}ies`);
  }
  return [...variants];
};

const getSearchTerms = (query) => {
  const rawTokens = tokenize(query);
  const normalizedTokens = rawTokens.map(normalizeToken).filter(Boolean);
  const meaningfulTokens = normalizedTokens.filter(
    (token) => !STOP_WORDS.has(token)
  );
  const baseTokens = meaningfulTokens.length ? meaningfulTokens : normalizedTokens;

  const terms = new Set([query.toLowerCase().trim()]);
  baseTokens.forEach((token) => {
    getWordVariants(token).forEach((variant) => terms.add(variant));
    terms.add(token);
  });

  if (baseTokens.length > 1) {
    for (let i = 0; i < baseTokens.length - 1; i += 1) {
      terms.add(`${baseTokens[i]} ${baseTokens[i + 1]}`);
    }
  }

  return [...terms].filter((term) => term && term.length > 1);
};

const buildApiSearchQuery = (query, searchTerms) => {
  if (!query) return DEFAULT_QUERY;

  const terms = [`"${query.trim()}"`, ...searchTerms]
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => (term.includes(" ") ? `"${term}"` : term));
  return [...new Set(terms)].slice(0, 18).join(" OR ");
};

const isTermMatch = (text, normalizedWords, term) => {
  if (!term) return false;

  const rawTerm = term.toLowerCase();
  const normalizedTerm = normalizeToken(term);
  if (!normalizedTerm) return false;

  if (text.includes(rawTerm)) return true;
  if (normalizedWords.has(normalizedTerm)) return true;

  if (normalizedTerm.length >= 4) {
    for (const word of normalizedWords) {
      if (word.startsWith(normalizedTerm) || normalizedTerm.startsWith(word)) {
        return true;
      }
    }
  }

  return false;
};

const rankArticlesByTerms = (articles, searchTerms) => {
  if (!searchTerms.length) return articles;

  const rankedArticles = articles
    .map((article) => {
      const titleText = (article.title || "").toLowerCase();
      const descriptionText = (article.description || "").toLowerCase();
      const contentText = (article.content || "").toLowerCase();

      const titleWords = new Set(
        tokenizeText(titleText).map(normalizeToken).filter(Boolean)
      );
      const descriptionWords = new Set(
        tokenizeText(descriptionText).map(normalizeToken).filter(Boolean)
      );
      const contentWords = new Set(
        tokenizeText(contentText).map(normalizeToken).filter(Boolean)
      );

      let score = 0;
      searchTerms.forEach((term) => {
        if (isTermMatch(titleText, titleWords, term)) score += 3;
        if (isTermMatch(descriptionText, descriptionWords, term)) score += 2;
        if (isTermMatch(contentText, contentWords, term)) score += 1;
      });

      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.article);

  return rankedArticles.length ? rankedArticles : articles;
};

const normalizeArticles = (articles = []) =>
  articles
    .map((article) => ({
      id: article.article_id || article.link || article.url,
      title: article.title || "No title",
      description:
        article.description || article.content || "No description available",
      url: article.link || article.url,
      urlToImage: article.image_url || article.urlToImage || null,
      content: article.content || "",
    }))
    .filter((article) => article.title && article.url);

const ensureSuccessResponse = (payload) => {
  if (!payload) {
    throw new Error("Empty response from API");
  }

  const status = String(payload.status || "").toLowerCase();
  if (status && status !== "success" && status !== "ok") {
    throw new Error(payload.message || payload.results || "Unable to fetch news");
  }

  return payload;
};

const FALLBACK_ARTICLES = normalizeArticles(fallbackNews.articles || []);

class News extends Component {
  constructor() {
    super();
    this.state = {
      articles: FALLBACK_ARTICLES.slice(0, PAGE_SIZE),
      loading: false,
      page: 1,
      totalResults: FALLBACK_ARTICLES.length,
      query: "",
      country: "us",
      countries: COUNTRY_OPTIONS,
      pageTokens: { 1: null },
      nextPageToken: null,
      errorMessage: "",
    };
    this.activeRequestId = 0;
  }

  componentDidMount() {
    this.fetchNews("", this.state.country, 1, true);
  }

  fetchNews = async (
    query = this.state.query,
    country = this.state.country,
    page = this.state.page,
    resetPagination = false
  ) => {
    const normalizedQuery = (query || "").trim();
    const selectedCountry = country || "us";
    const currentPage = page || 1;
    const requestId = ++this.activeRequestId;

    const currentPageTokens = resetPagination
      ? { 1: null }
      : { ...this.state.pageTokens };
    const pageToken =
      currentPage <= 1 ? null : currentPageTokens[currentPage] || null;

    this.setState({
      loading: true,
      country: selectedCountry,
      page: currentPage,
      ...(resetPagination ? { pageTokens: { 1: null }, nextPageToken: null } : {}),
    });

    try {
      const searchTerms = normalizedQuery ? getSearchTerms(normalizedQuery) : [];
      const apiQuery = buildApiSearchQuery(normalizedQuery, searchTerms);

      const params = new URLSearchParams({
        apikey: API_KEY,
        q: apiQuery,
        country: selectedCountry,
        language: "en",
      });
      if (pageToken) {
        params.set("page", pageToken);
      }

      const response = await fetch(`${NEWSDATA_API_URL}?${params.toString()}`);
      let payload = ensureSuccessResponse(await response.json());
      if (requestId !== this.activeRequestId) return;

      let cleanedArticles = normalizeArticles(
        payload.results || payload.articles || []
      );
      let rankedArticles = normalizedQuery
        ? rankArticlesByTerms(cleanedArticles, searchTerms)
        : cleanedArticles;

      let nextPageToken = payload.nextPage || null;
      let usedGlobalFallback = false;

      // If strict country search has no relevant result, broaden to global.
      if (normalizedQuery && !rankedArticles.length) {
        const globalParams = new URLSearchParams({
          apikey: API_KEY,
          q: apiQuery,
          language: "en",
        });
        const globalResponse = await fetch(
          `${NEWSDATA_API_URL}?${globalParams.toString()}`
        );
        const globalPayload = ensureSuccessResponse(await globalResponse.json());
        if (requestId !== this.activeRequestId) return;

        const globalArticles = normalizeArticles(
          globalPayload.results || globalPayload.articles || []
        );
        const globalRankedArticles = rankArticlesByTerms(
          globalArticles,
          searchTerms
        );

        if (globalRankedArticles.length) {
          usedGlobalFallback = true;
          payload = globalPayload;
          cleanedArticles = globalArticles;
          rankedArticles = globalRankedArticles;
          nextPageToken = globalPayload.nextPage || null;
        }
      }

      const updatedPageTokens = resetPagination || usedGlobalFallback
        ? { 1: null }
        : { ...this.state.pageTokens };
      updatedPageTokens[currentPage] = pageToken;
      if (nextPageToken) {
        updatedPageTokens[currentPage + 1] = nextPageToken;
      } else {
        delete updatedPageTokens[currentPage + 1];
      }

      this.setState({
        articles: rankedArticles,
        totalResults: payload.totalResults || rankedArticles.length,
        loading: false,
        query: normalizedQuery,
        page: currentPage,
        pageTokens: updatedPageTokens,
        nextPageToken,
        errorMessage: "",
      });
    } catch (error) {
      if (requestId !== this.activeRequestId) return;

      const searchTerms = normalizedQuery ? getSearchTerms(normalizedQuery) : [];
      const fallbackArticles = normalizedQuery
        ? rankArticlesByTerms(FALLBACK_ARTICLES, searchTerms)
        : FALLBACK_ARTICLES;
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const pagedFallback = fallbackArticles.slice(startIndex, startIndex + PAGE_SIZE);

      this.setState({
        articles: pagedFallback.length
          ? pagedFallback
          : fallbackArticles.slice(0, PAGE_SIZE),
        totalResults: fallbackArticles.length,
        loading: false,
        query: normalizedQuery,
        page: currentPage,
        nextPageToken: null,
        errorMessage:
          "Live NewsData API unavailable or limit reached. Showing sample news.",
      });
    }
  };

  handleSearch = (query) => {
    this.fetchNews(query, this.state.country, 1, true);
  };

  handleCountryChange = (countryCode) => {
    this.fetchNews(this.state.query, countryCode, 1, true);
  };

  handlePrevClick = () => {
    const previousPage = this.state.page - 1;
    if (previousPage < 1) return;
    this.fetchNews(this.state.query, this.state.country, previousPage);
  };

  handleNextClick = () => {
    const nextPage = this.state.page + 1;
    if (!this.state.nextPageToken) return;
    this.fetchNews(this.state.query, this.state.country, nextPage);
  };

  render() {
    const selectedCountryLabel =
      this.state.countries.find(
        (country) => country.code === this.state.country
      )?.label || this.state.country.toUpperCase();

    return (
      <>
        <Navbar
          onSearch={this.handleSearch}
          countries={this.state.countries}
          selectedCountry={this.state.country}
          onCountryChange={this.handleCountryChange}
        />

        <div className="container my-3">
          <h1>Xpress - Top Headlines ({selectedCountryLabel})</h1>

          {this.state.loading && <p>Loading...</p>}
          {this.state.errorMessage && (
            <div className="alert alert-warning py-2">{this.state.errorMessage}</div>
          )}

          <div className="row">
            {this.state.articles.map((element) => (
              <div className="col-md-4 mb-3" key={element.id || element.url}>
                <Newitem
                  title={element.title}
                  description={
                    element.description
                      ? element.description.slice(0, 100)
                      : "No description available"
                  }
                  imageUrl={element.urlToImage}
                  url={element.url}
                />
              </div>
            ))}
          </div>

          <div className="container d-flex justify-content-evenly my-3">
            <button
              type="button"
              disabled={this.state.page <= 1 || this.state.loading}
              className="btn btn-primary"
              onClick={this.handlePrevClick}
            >
              &laquo; Previous
            </button>
            <button
              type="button"
              disabled={!this.state.nextPageToken || this.state.loading}
              className="btn btn-primary"
              onClick={this.handleNextClick}
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default News;
