import React, { Component } from "react";
import Image from "./components/Image";
import UploadFile from "./components/UploadFile";
import DownloadFile from "./components/DownloadFile";
import Error from "./components/Error";
import { Container } from "reactstrap";

const EMPTY_CELL_FILL_SYMBOL = " ";
const DEFAULT_FILL_SYMBOL = "x";

class App extends Component {
  state = {
    points: [],
    isImageLoading: false,
    error: {
      hasOccurred: false,
      message: ""
    },
    parsedCommands: []
  };

  render() {
    return (
      <Container>
        <UploadFile onFileUpload={this.handleUploadFile}></UploadFile>
        <DownloadFile
          imageInStringFormat={this.getImageInStringFormat(this.state.points)}
          isImageLoading={this.state.isImageLoading}
        ></DownloadFile>
        <Error error={this.state.error}></Error>
        <Image
          points={this.state.points}
          isImageLoading={this.state.isImageLoading}
          onImageWasLoaded={this.state.handleImageWasLoaded}
        ></Image>
      </Container>
    );
  }

  handleUploadFile = file => {
    this.setState({
      isImageLoading: true,
      error: {
        hasOccurred: false,
        message: ""
      }
    });

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      this.setState({
        isImageLoading: false,
        points: this.makeCommands(reader.result)
      });
    };

    reader.onerror = () => {
      this.handleError("Невозможно прочитать этот файл");
    };
  };

  handleError(message) {
    this.setState({
      error: {
        hasOccurred: true,
        message
      },
      parsedCommands: []
    });
  }

  makeCommands(commands) {
    this.setState({ parsedCommands: this.parseCommands(commands) });
    let points = this.makeParsedCommands();
    return points;
  }

  parseCommands(commands) {
    let commandsArray = commands.split("\n");
    let parsedCommands = commandsArray.map(command => {
      const parts = command.split(" ");
      return {
        name: parts[0],
        arguments: parts
          .slice(1)
          .map(argument =>
            !isNaN(Number(argument)) ? Number(argument) : argument
          )
      };
    });
    return parsedCommands;
  }

  makeParsedCommands() {
    let points = [];
    for (let index = 0; index < this.state.parsedCommands.length; index++) {
      switch (this.state.parsedCommands[index].name) {
        case "C":
          points = this.createEmptyCanvas(
            ...this.state.parsedCommands[index].arguments
          );
          let canvasPointsToFill = this.getCanvasPointsToFill(
            ...this.state.parsedCommands[index].arguments
          );
          this.fillPoints(points, canvasPointsToFill, EMPTY_CELL_FILL_SYMBOL);
          break;
        case "L":
          /* argument - 1, т.к в примере input.txt индексация для расположения
            линий, прямоугольников, заливки начинается с 1.*/
          const linePointsToFill = this.getLinePointsToFill(
            ...this.state.parsedCommands[index].arguments.map(
              argument => argument - 1
            )
          );
          this.fillPoints(points, linePointsToFill);
          break;
        case "R":
          this.fillPoints(
            points,
            this.getRectanglePointsToFill(
              ...this.state.parsedCommands[index].arguments.map(
                argument => argument - 1
              )
            )
          );
          break;
        case "B":
          const x = this.state.parsedCommands[index].arguments[0];
          const y = this.state.parsedCommands[index].arguments[1];
          const color = this.state.parsedCommands[index].arguments[2];
          this.makeBucketFill(points, x - 1, y - 1, color);
          break;
        default:
          this.handleError(
            `Использована недопустимая команда  "${this.state.parsedCommands[index].name}"`
          );
      }
    }
    return points;
  }

  createEmptyCanvas(totalColumns, totalRows) {
    if (totalColumns >= 0 && totalRows >= 0) {
      let canvas = new Array(Number(totalRows));

      for (let i = 0; i < totalRows; i++) {
        canvas[i] = new Array(Number(totalColumns));
      }
      return canvas;
    }
  }

  getCanvasPointsToFill(totalColumns, totalRows) {
    let canvasPointsToFill = [];

    for (let row = 0; row < totalRows; row++) {
      for (let column = 0; column < totalColumns; column++) {
        canvasPointsToFill.push({ row, column });
      }
    }
    return canvasPointsToFill;
  }

  fillPoints(canvas, points, fillSymbol = DEFAULT_FILL_SYMBOL) {
    if (this.checkIsCanvasExists(canvas)) {
      for (const point of points) {
        if (this.checkIsPointInCanvasBounds(canvas, point.row, point.column)) {
          canvas[point.row][point.column] = fillSymbol;
        } else {
          this.handleError("Вы вышли за границу поля для рисования");
          break;
        }
      }
    } else {
      this.handleError("Не создано поле для рисования");
    }
  }

  checkIsPointInCanvasBounds(canvas, rowIndex, columnIndex) {
    return (
      rowIndex < canvas.length &&
      columnIndex < canvas[0].length &&
      rowIndex >= 0 &&
      columnIndex >= 0
    );
  }

  checkIsCanvasExists(canvas) {
    return canvas && canvas[0];
  }

  getLinePointsToFill(x1, y1, x2, y2) {
    const linePointsToFill = [];
    if (x1 === x2) {
      let [startY, endY] = this.sortArrayByAsceding([y1, y2]);
      for (let y = startY; y <= endY; y++) {
        linePointsToFill.push({ row: y, column: x1 });
      }
    } else if (y1 === y2) {
      let [startX, endX] = this.sortArrayByAsceding([x1, x2]);
      for (let x = startX; x <= endX; x++) {
        linePointsToFill.push({ row: y1, column: x });
      }
    }
    return linePointsToFill;
  }

  sortArrayByAsceding = array => array.sort((a, b) => a - b);

  getRectanglePointsToFill(topLeftX, topLeftY, bottomRightX, bottomRightY) {
    const rectanglePointsToFill = [];

    rectanglePointsToFill.push(
      ...this.getLinePointsToFill(topLeftX, topLeftY, bottomRightX, topLeftY)
    );
    rectanglePointsToFill.push(
      ...this.getLinePointsToFill(
        bottomRightX,
        topLeftY,
        bottomRightX,
        bottomRightY
      )
    );
    rectanglePointsToFill.push(
      ...this.getLinePointsToFill(
        bottomRightX,
        bottomRightY,
        topLeftX,
        bottomRightY
      )
    );
    rectanglePointsToFill.push(
      ...this.getLinePointsToFill(topLeftX, bottomRightY, topLeftX, topLeftY)
    );
    return rectanglePointsToFill;
  }

  makeBucketFill(points, startColumn, startRow, newColor) {
    if (this.checkIsCanvasExists(points)) {
      if (this.checkIsPointInCanvasBounds(points, startRow, startColumn)) {
        const color = points[startRow][startColumn];

        if (color !== newColor) {
          const stack = [];

          stack.push([startRow, startColumn]);
          while (stack.length) {
            const [y, x] = stack.pop();
            points[y][x] = newColor;

            if (x - 1 >= 0 && points[y][x - 1] === color) {
              stack.push([y, x - 1]);
            }
            if (x + 1 < points[0].length && points[y][x + 1] === color) {
              stack.push([y, x + 1]);
            }
            if (y - 1 >= 0 && points[y - 1][x] === color) {
              stack.push([y - 1, x]);
            }
            if (y + 1 < points.length && points[y + 1][x] === color) {
              stack.push([y + 1, x]);
            }
          }
        }
      } else {
        this.handleError("Вы вышли за границу поля для рисования");
      }
    } else {
      this.handleError("Не создано поле для рисования");
    }
  }

  getImageInStringFormat(points) {
    let image = "";
    let totalColumns = 0;
    let totalRows = 0;

    if (points && points[0]) {
      totalColumns = points[0].length;
      totalRows = points.length;

      // +2, т.к строка на 2 символа длиннее из-за "|" в начале и конце каждой строки,
      image += this.drawHorizontalBorder(totalColumns + 2);
      image += "\n";
      for (let row = 0; row < totalRows; row++) {
        image += "|";
        for (let column = 0; column < totalColumns; column++) {
          image += points[row][column];
        }
        image += "|\n";
      }
      image += this.drawHorizontalBorder(totalColumns + 2);
    }
    return image;
  }

  drawHorizontalBorder(length) {
    let border = "";
    for (let i = 0; i < length; i++) {
      border += "-";
    }
    return border;
  }
}

export default App;
