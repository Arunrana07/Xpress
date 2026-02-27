import React, { Component } from "react";
import Newitem from "./Newitem";
import Navbar from "./Navbar";

class News extends Component {
  constructor() {
    super();
    this.state = {
      articles: [],
      loading: false,
      page: 1,
      totalResults: 0,
      query: "", // Current search term
    };
    this.activeRequestId = 0;
  }

  async componentDidMount() {
    this.fetchNews("", 1);
  }

  // Fetch news (top headlines or search)
  fetchNews = async (query = this.state.query, page = this.state.page) => {
    const normalizedQuery = query.trim();
    const currentPage = normalizedQuery ? page : page || 1;
    const requestId = ++this.activeRequestId;

    this.setState({ loading: true });

    const url = normalizedQuery
      ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          normalizedQuery
        )}&searchIn=title,description&language=en&sortBy=relevancy&apiKey=b8eef6d1caf845fd841a556284da658e&page=${currentPage}&pageSize=20`
      : `https://newsapi.org/v2/top-headlines?country=us&category=business&language=en&apiKey=b8eef6d1caf845fd841a556284da658e&page=${currentPage}&pageSize=20`;

    const data = await fetch(url);
    const parsedData = await data.json();
    if (requestId !== this.activeRequestId) return;

    const cleanedArticles =
      parsedData.articles?.filter(
        (article) => article && article.title && article.url
      ) || [];

    const filteredArticles = normalizedQuery
      ? cleanedArticles.filter((article) => {
          const searchableText = `${article.title || ""} ${
            article.description || ""
          }`.toLowerCase();
          return searchableText.includes(normalizedQuery.toLowerCase());
        })
      : cleanedArticles;

    this.setState({
      articles: filteredArticles,
      totalResults: parsedData.totalResults || 0,
      loading: false,
      query: normalizedQuery,
      page: currentPage,
    });
  };

  handleSearch = (query) => {
    this.fetchNews(query, 1);
  };

  handlePrevClick = async () => {
    const previousPage = this.state.page - 1;
    if (previousPage < 1) return;
    this.fetchNews(this.state.query, previousPage);
  };

  handleNextClick = async () => {
    const nextPage = this.state.page + 1;
    if (nextPage > Math.ceil(this.state.totalResults / 20)) return;
    this.fetchNews(this.state.query, nextPage);
  };

  render() {
    return (
      <>
        {/* Navbar with search */}
        <Navbar onSearch={this.handleSearch} />

        <div className="container my-3">
          <h1>Xpress - Top Headlines</h1>

          {this.state.loading && <p>Loading...</p>}

          <div className="row">
            {this.state.articles.map((element) => (
              <div className="col-md-4 mb-3" key={element.url}>
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

          {/* Pagination buttons */}
          <div className="container d-flex justify-content-evenly my-3">
            <button
              type="button"
              disabled={this.state.page <= 1}
              className="btn btn-primary"
              onClick={this.handlePrevClick}
            >
              &laquo; Previous
            </button>
            <button
              type="button"
              disabled={this.state.page >= Math.ceil(this.state.totalResults / 20)}
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
