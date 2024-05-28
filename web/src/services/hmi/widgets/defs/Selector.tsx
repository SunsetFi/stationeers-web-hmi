import React from "react";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

import { useDIDependency } from "@/container";

import {
  useHmiScreenContext,
  useHmiScreenTemplateStringObservation,
} from "../../screens/HmiScreenRenderer/hooks";

import { HmiActionExecutor } from "../../actions/HmiActionExecutor";
import { HmiAction } from "../../actions/types";

import { WidgetBase } from "../types";
import { commonWidgetStyleToSx } from "../style";

import { WidgetDef } from "./types";
import { FormulaCompiler } from "@/services/formula/FormulaCompiler";
import { Subscription } from "rxjs";

export interface SelectorWidget extends WidgetBase {
  type: "selector";
  label: string;
  fontSize?: number;
  items: SelectWidgetItem[];
}

export interface SelectWidgetItem {
  isSelected: string;
  label: string;
  selectAction: HmiAction | HmiAction[];
}

export const SelectWidgetDef: WidgetDef<SelectorWidget> = {
  Component: ({ widget }: { widget: SelectorWidget }) => {
    const context = useHmiScreenContext();

    const sx: any = {
      alignSelf: "center",
      ...commonWidgetStyleToSx(widget),
    };

    if (widget.fontSize) {
      sx.fontSize = widget.fontSize;
    }

    const label = useHmiScreenTemplateStringObservation(widget.label);

    const executor = useDIDependency(HmiActionExecutor);
    const [working, setWorking] = React.useState(false);
    const onChange = React.useCallback(
      async (e: SelectChangeEvent<HTMLInputElement>) => {
        const index = Number(e.target.value);
        const selectedItem = widget.items[index];
        if (selectedItem && selectedItem.selectAction) {
          setWorking(true);
          const actions = Array.isArray(selectedItem.selectAction)
            ? selectedItem.selectAction
            : [selectedItem.selectAction];
          try {
            await Promise.all(
              actions.map((a) => executor.executeAction(context, a))
            );
          } finally {
            setWorking(false);
          }
        }
      },
      [context, executor, widget.items]
    );

    const formulaCompiler = useDIDependency(FormulaCompiler);
    const [itemsSelected, setItemsSelected] = React.useState<boolean[]>(
      new Array(widget.items.length).fill(false)
    );
    React.useEffect(() => {
      let subscriptions: Subscription[] = [];
      for (let i = 0; i < widget.items.length; i++) {
        subscriptions.push(
          formulaCompiler
            .compileFormula(widget.items[i].isSelected, context)
            .subscribe((value) => {
              setItemsSelected((itemsSelected) => {
                const newItemsSelected = [...itemsSelected];
                newItemsSelected[i] = !!value;
                return newItemsSelected;
              });
            })
        );
      }

      return () => {
        subscriptions.forEach((s) => s.unsubscribe());
      };
    }, [widget.items]);

    const selectedValue = itemsSelected.findIndex((x) => x);
    return (
      <FormControl>
        <InputLabel>{label}</InputLabel>
        <Select
          sx={sx}
          label={label}
          value={selectedValue as any}
          disabled={working}
          onChange={onChange}
        >
          {widget.items.map((item, index) => (
            <MenuItem key={index} value={index}>
              <SelectWidgetLabel label={item.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  },
};

const SelectWidgetLabel: React.FC<{ label: string }> = ({ label }) => {
  const resolvedLabel = useHmiScreenTemplateStringObservation(label);
  return <>{resolvedLabel}</>;
};
