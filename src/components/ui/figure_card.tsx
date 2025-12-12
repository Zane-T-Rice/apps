import { SelectableCardRoot } from "./selectable_card_root";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { RefObject, useMemo } from "react";
import { SelectableFigureCardBody } from "./selectable_figure_card_body";

export function FigureCard(props: {
  figure: Figure;
  selected: boolean;
  onFigureDelete: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureEdit: (figure: Figure, silent?: boolean) => Promise<boolean>;
  ref: RefObject<HTMLDivElement | null>;
}) {
  const { figure, selected, onFigureDelete, onFigureEdit, ref } = props;

  const figureCard = useMemo(() => {
    return (
      <SelectableCardRoot selected={selected} ref={ref}>
        <SelectableFigureCardBody
          figure={figure}
          onFigureDelete={onFigureDelete}
          onFigureEdit={onFigureEdit}
        />
      </SelectableCardRoot>
    );
  }, [figure, selected, ref, onFigureDelete, onFigureEdit]);

  return figureCard;
}
