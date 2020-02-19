import React, { Component } from "react";
import { Button } from "reactstrap";
import { saveAs } from "file-saver";

class DownloadFile extends Component {
  render() {
    const { imageInStringFormat, isImageLoading } = this.props;
    if (imageInStringFormat && !isImageLoading) {
      return (
        <Button
          className="mb-3"
          onClick={() => downloadTextFile("output.txt", imageInStringFormat)}
        >
          Скачать результат
        </Button>
      );
    } else {
      return <div></div>;
    }
  }
}

function downloadTextFile(filename, text) {
  saveAs(
    new Blob([text], {
      type: "text/plain;charset=utf-8"
    }),
    filename
  );
}

export default DownloadFile;
