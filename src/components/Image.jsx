import React, { Component } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import "./imageStyles.css";
import { Spinner } from "reactstrap";

class Image extends Component {
  getCell = ({ rowIndex, columnIndex, style }) => {
    return (
      <div
        className={
          checkIsGridItemEven(columnIndex, rowIndex)
            ? "GridItemEven"
            : "GridItemOdd"
        }
        style={style}
      >
        {this.props.points[rowIndex][columnIndex]}
      </div>
    );
  };

  render() {
    const MAX_VISIBLE_COLUMNS_ON_PAGE = 35;
    const COLUMN_WIDTH = 35;
    const MAX_VISIBLE_ROWS_ON_PAGE = 15;
    const ROW_HEIGHT = 35;

    const { points } = this.props;
    let totalColumns = 0;
    let totalRows = 0;
    if (this.props.isImageLoading) {
      return <Spinner color="primary" />;
    } else if (points && points[0]) {
      totalColumns = points[0].length;
      totalRows = points.length;
      return (
        <AutoSizer>
          {({ width }) => {
            const columnsCountOnPage =
              totalColumns > MAX_VISIBLE_COLUMNS_ON_PAGE
                ? MAX_VISIBLE_COLUMNS_ON_PAGE
                : totalColumns;
            const rowsCountOnPage =
              totalRows > MAX_VISIBLE_ROWS_ON_PAGE
                ? MAX_VISIBLE_ROWS_ON_PAGE
                : totalRows;
            return (
              <Grid
                className="Grid"
                columnCount={totalColumns}
                columnWidth={COLUMN_WIDTH}
                height={rowsCountOnPage * ROW_HEIGHT}
                rowCount={totalRows}
                rowHeight={ROW_HEIGHT}
                width={
                  columnsCountOnPage * COLUMN_WIDTH > width
                    ? width
                    : columnsCountOnPage * COLUMN_WIDTH
                }
              >
                {this.getCell}
              </Grid>
            );
          }}
        </AutoSizer>
      );
    } else {
      return <div></div>;
    }
  }
}

function checkIsGridItemEven(rowIndex, columnIndex) {
  return (columnIndex + rowIndex) % 2 === 0;
}

export default Image;
