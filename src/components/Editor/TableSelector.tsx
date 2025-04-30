import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Grid, Table as TableIcon } from "lucide-react";

interface TableSelectorProps {
  onSelectTable: (rows: number, cols: number) => void;
}

export const TableSelector = ({ onSelectTable }: TableSelectorProps) => {
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
  
  // Create a grid with 10x10 cells for selection
  const maxRows = 10;
  const maxCols = 10;
  
  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };
  
  const handleClick = () => {
    // Add 1 to rows and cols because arrays are 0-indexed
    const rows = hoveredCell.row + 1;
    const cols = hoveredCell.col + 1;
    onSelectTable(rows, cols);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <TableIcon className="h-4 w-4" />
          <span>Table</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-10 gap-1 rounded-sm" 
               style={{ width: 'fit-content' }}>
            {Array.from({ length: maxRows }).map((_, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                {Array.from({ length: maxCols }).map((_, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`w-5 h-5 rounded-sm transition-colors border ${
                      rowIndex <= hoveredCell.row && colIndex <= hoveredCell.col
                        ? 'bg-primary border-primary'
                        : 'bg-secondary border-muted-foreground/20'
                    }`}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onClick={handleClick}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground">
            {hoveredCell.row > 0 || hoveredCell.col > 0
              ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1}`
              : 'Hover to select table size'}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TableSelector; 