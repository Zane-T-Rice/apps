import { Button, ButtonProps } from "../recipes/button";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { useDrawer } from "@/app/utils/use_drawer";
import { CiEdit } from "react-icons/ci";
import { AutoFormDrawer } from "./auto_form_drawer";
import { number, object } from "yup";

const transformInt = (value: number): number | null => {
  return isNaN(value) ? null : value;
};
const numberSchema = number().transform(transformInt).integer();

const editMonsterFigureSchema = object({
  maximumHP: numberSchema.required(),
  move: numberSchema.nullable().optional(),
  attack: numberSchema.nullable().optional(),
}).stripUnknown();

const editSummonFigureSchema = editMonsterFigureSchema
  .concat(
    object({
      range: numberSchema.nullable().optional(),
    }),
  )
  .stripUnknown();

const desiredFieldOrder = {
  maximumHP: 1,
  move: 2,
  attack: 3,
  range: 4,
};

export default function EditFigureButton(
  props: {
    onFigureEdit: (record: Figure) => Promise<boolean>;
    figure: Figure;
  } & ButtonProps,
) {
  const { onFigureEdit: _onFigureEdit, figure, ...buttonProps } = props;
  const { onCreateButton, hasCreatePermission, isCreateOpen, setIsCreateOpen } =
    useDrawer();

  const onEdit = (updatedFigure: Figure): Promise<boolean> => {
    return _onFigureEdit({ ...figure, ...updatedFigure });
  };

  const isSummon = figure.rank && figure.rank.toLowerCase() === "summon";
  const isMonster =
    figure.rank &&
    (figure.rank.toLowerCase() === "normal" ||
      figure.rank.toLowerCase() === "elite" ||
      figure.rank.toLowerCase() === "boss");

  return (
    <>
      <Button
        onClick={() => onCreateButton()}
        disabled={!hasCreatePermission}
        hidden={!isSummon && !isMonster}
        {...buttonProps}
      >
        <CiEdit />
      </Button>
      <AutoFormDrawer
        record={figure}
        title="Edit Figure"
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onEdit}
        resourceSchema={
          isSummon ? editSummonFigureSchema : editMonsterFigureSchema
        }
        desiredFieldOrder={desiredFieldOrder}
      />
    </>
  );
}
