export const MODE = {
    DRAW: "Рисовать",
    EDIT: "Редактировать",
    VIEW: "Осмотреть"
}
export const POLYGON_TYPE = {
    GRASS: "Трава",
    BUILDING: "Здание",
    FENCE: "Забор"
}

export const TYPE_COLORS = {
    [POLYGON_TYPE.GRASS]: "green",
    [POLYGON_TYPE.BUILDING]: "red",
    [POLYGON_TYPE.FENCE]: "blue"
};

export const NEXT_TYPE = {
    [POLYGON_TYPE.GRASS]: POLYGON_TYPE.BUILDING,
    [POLYGON_TYPE.BUILDING]: POLYGON_TYPE.FENCE,
    [POLYGON_TYPE.FENCE]: POLYGON_TYPE.GRASS
}

export const TASK_STATUS = {
    "pending": "pending",
    "failed": "failed",
    "completed": "completed",
}