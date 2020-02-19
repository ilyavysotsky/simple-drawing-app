import React, { Component } from "react";
import { FormGroup, Label, Input } from "reactstrap";

class UploadFile extends Component {
  readFile = event => {
    let file = event.target.files[0];
    if (file) {
      this.props.onFileUpload(file);
    }
  };

  render() {
    return (
      <FormGroup>
        <Label for="uploadFile">Загрузить файл:</Label>
        <Input type="file" id="uploadFile" onChange={this.readFile} />
      </FormGroup>
    );
  }
}

export default UploadFile;
