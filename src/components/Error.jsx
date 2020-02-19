import React, { Component } from "react";
import { Alert } from "reactstrap";
class Error extends Component {
  render() {
    return this.props.error.hasOccurred ? (
      <Alert color="danger">Ошибка: {this.props.error.message}</Alert>
    ) : (
      <div></div>
    );
  }
}

export default Error;
