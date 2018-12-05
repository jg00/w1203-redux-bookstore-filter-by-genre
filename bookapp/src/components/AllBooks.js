import React, { Component } from "react";
import { setAuthenticationToken } from "../utils";
import axios from "axios";
import { Link, NavLink } from "react-router-dom";
import { connect } from "react-redux";
import history from "../history";
import Header from "./Header";

class AllBooks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: []
    };
  }

  addBookButton = () => {
    history.push("/add-book");
  };
  // componentWillReceiveProps = (nextprops) => {
  //   axios.get(`http://localhost:3050/api/getBooks/${this.props.genre}`).then((res)=> {
  //     if(this._isMounted){
  //     this.setState({
  //        books: res.data
  //        })
  //      }
  //        this.props.history.push('/')
  //   }).catch((error)=>{
  //     this.props.history.push('/login')
  //   })
  //
  // }

  componentDidMount = () => {
    let token = localStorage.getItem("jsonwebtoken");
    setAuthenticationToken(token);
    axios
      .get(this.props.url)
      .then(res => {
        this.setState({
          books: res.data
        });
        this.props.history.push("/");
      })
      .catch(error => {
        this.props.history.push("/login");
      });
  };

  deleteBook = each => {
    fetch("http://localhost:3050/delete-book/" + each.id, {
      method: "delete"
    }).then(response => {
      let arr = this.state.books;
      let newarr = arr.filter(function(book) {
        return each.id !== book.id;
      });
      this.setState({
        books: newarr
      });
      console.log("success");
      this.props.history.push("/");
    });
  };

  edit = bookId => {
    console.log(bookId);
    this.props.history.push(`/update-book/${bookId}`);
  };

  render() {
    let filteredBooksbyGenre = this.state.books.filter(b => {
      return b.category === this.props.genreProps;
    });
    // console.log(filteredBooksbyGenre);

    // let books = this.state.books.map(each => {
    let books = filteredBooksbyGenre.map(each => {
      return (
        <div className="card" key={each.id}>
          <img
            id="pictures"
            className="card-img-top"
            src={each.imageurl}
            alt="Card image cap"
          />
          <div className="card-body">
            <div className="cardTitle">
              <h3 className="card-text car-title">{each.booktitle}</h3>
            </div>
            <p className="card-text">
              <b>Author:</b> {each.author}
            </p>
            <p className="card-text">
              <b>Genre: </b>
              {each.category}
            </p>
            <p className="card-text">
              <b>Published on: </b>
              {each.publisheddate}
            </p>
            <div className="btn-div">
              <button
                className="btn btn-primary buttons"
                onClick={this.deleteBook.bind(this, each)}
              >
                Delete
              </button>
              <button
                onClick={() => this.edit(each.id)}
                className="btn btn-warning buttons"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      );
    });
    return (
      <div>
        <div className="maindiv">{books}</div>

        <button
          onClick={this.addBookButton}
          className="addButton btn btn-warning"
        >
          Add Book
        </button>
      </div>
    );
  }
}
// map global state to local props
const mapStateToProps = state => {
  return {
    url: state.url, //this.props.isAuthenticated
    //ctr: state.counter // this.props.ctr
    genreProps: state.genre
  };
};

// make the dispatches available on local props
// dispatch is used to communicate with the reducer
// so the reducer can change the global state
const mapDispatchToProps = dispatch => {
  return {
    // this.props.onIncrementCounter
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllBooks);
