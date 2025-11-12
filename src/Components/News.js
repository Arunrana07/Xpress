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
  }

  async componentDidMount() {
    this.fetchNews();
  }

  // Fetch news (top headlines or search)
  fetchNews = async (query = "") => {
    this.setState({ loading: true });

    const url = query
      ? `https://newsapi.org/v2/everything?q=${query}&apiKey=b8eef6d1caf845fd841a556284da658e&page=1&pageSize=20`
      : `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=b8eef6d1caf845fd841a556284da658e&page=${this.state.page}&pageSize=20`;

    const data = await fetch(url);
    const parsedData = await data.json();

    const cleanedArticles =
      parsedData.articles?.filter(
        (article) => article && article.title && article.url
      ) || [];

    this.setState({
      articles: cleanedArticles,
      totalResults: parsedData.totalResults || 0,
      loading: false,
      query,
      page: query ? 1 : this.state.page, // reset page to 1 for new search
    });
  };

  handleSearch = (query) => {
    this.fetchNews(query);
  };

  handlePrevClick = async () => {
    this.setState(
      { page: this.state.page - 1 },
      () => this.fetchNews(this.state.query)
    );
  };

  handleNextClick = async () => {
    if (this.state.page + 1 > Math.ceil(this.state.totalResults / 20)) return;
    this.setState(
      { page: this.state.page + 1 },
      () => this.fetchNews(this.state.query)
    );
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
