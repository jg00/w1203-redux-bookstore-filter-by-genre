import React, { Component } from 'react';
import { setAuthenticationToken} from '../utils'
import axios from 'axios'



export class UpdateBook extends Component {
  constructor(props){
    super(props)
    this.state={
      books: [],

    }
  }

  componentDidMount() {
    let token = localStorage.getItem("jsonwebtoken")
    setAuthenticationToken(token)
    let bookId = this.props.match.params.bookId


    axios('http://localhost:3050/api/getBooks').then((response)=>{
      let bookToUpdate= response.data.find((book)=>{
        return book.id == bookId

    })
    console.log(bookToUpdate)
    this.setState({
      books:bookToUpdate
    })
  })
}



  updateBook = (e)=>{


    this.setState({

         books:{
           ...this.state.books,
        [e.target.name] :e.target.value}
      })


  }
sendUpdateReq=() =>{
  fetch('http://localhost:3050/updateBook/' + this.state.books.id,{
method: 'POST',
headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify({
  title: this.state.books.booktitle,
  publisheddate : this.state.books.publisheddate,
  author: this.state.books.author,
  imageUrl : this.state.books.imageurl,
  category: this.state.books.category

})
}).then((response) => {
return response.json()
}).then((json) => {
console.log(json)
if(json.success == true) {
this.props.history.push('/')
} else {

}
})
}
  render() {
    return (

      <div className="addBookContainer">
      <h2 className="addBookTitle">Update the Book</h2>
      <label>Edit Book Title:</label>
      <input onChange={this.updateBook} type="text" name="booktitle" defaultValue={this.state.books.booktitle}/> <br/>
      <label>Edit Published Date:</label>
      <input onChange={this.updateBook} type="date" name="publisheddate" defaultValue={this.state.books.publisheddate}/> <br/>
      <label>Edit Author:</label>
      <input onChange={this.updateBook} type="text" name="author" defaultValue={this.state.books.author}/> <br/>
      <label>Edit image URL:</label>
      <input onChange={this.updateBook} type="text" name="imageurl" defaultValue={this.state.books.imageurl}/> <br/>
      <label>Edit genre of the book:</label>
      <select name="category" onChange={this.updateBook}>
      <option selected disabled value>Select an option</option>
      <option value="Fiction">Fiction</option>
      <option value="Technical">Technical</option>
      <option value="Romance">Romance</option>
      <option value="Biography">Biography</option>
      </select> <br/>
      <button onClick={this.sendUpdateReq} className="btn btn-warning">Update the book</button>
      </div>

    )
  }

}
