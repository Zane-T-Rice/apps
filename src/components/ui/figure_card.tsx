import { SelectableCardRoot } from "./selectable_card_root";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { RefObject, useMemo } from "react";
import { SelectableCardBody } from "./selectable_card_body";

export function FigureCard(props: {
  figure: Figure;
  selectedFigure: Figure | undefined;
  onFigureCreate: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureDelete: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureEdit: (figure: Figure, silent?: boolean) => Promise<boolean>;
  ref: RefObject<HTMLDivElement | null>;
}) {
  const {
    figure,
    selectedFigure,
    onFigureCreate,
    onFigureDelete,
    onFigureEdit,
    ref,
  } = props;

  const figureCard = useMemo(() => {
    return (
      <SelectableCardRoot
        resourceId={figure.id}
        selectedResourceId={selectedFigure?.id}
        ref={ref}
      >
        <SelectableCardBody
          figure={figure}
          onFigureCreate={onFigureCreate}
          onFigureDelete={onFigureDelete}
          onFigureEdit={onFigureEdit}
        />
      </SelectableCardRoot>
    );
  }, [
    figure,
    selectedFigure?.id,
    ref,
    onFigureCreate,
    onFigureDelete,
    onFigureEdit,
  ]);

  return figureCard;
}
