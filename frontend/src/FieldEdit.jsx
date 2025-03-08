import ZoomAndScrollStage from "./FieldEdit/ZoomAndScrollStage.jsx";
import {Layer, Rect} from "react-konva";


const FieldEdit = ({scene_width, scene_height}) => {
    const MODE = {
        DRAW: "Рисовать",
        MOVE: "Двигать",
        EDIT: "Редактировать"
    }

    return (
        <>
            <ZoomAndScrollStage scene_width={scene_width} scene_height={scene_height}>
                <Layer>
                    <Rect fill="red" width={100} height={200} draggable={true}></Rect>
                </Layer>
            </ZoomAndScrollStage>
        </>
    );
};

export default FieldEdit;
