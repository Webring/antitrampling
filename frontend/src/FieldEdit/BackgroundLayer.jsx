import React from 'react';
import {Layer} from "react-konva";
import {observer} from "mobx-react-lite";

const BackgroundLayer = observer(() => {


    return (
        <Layer>

            {/*{*/}
            {/*    settings.background_url &&*/}
            {/*    image &&*/}
            {/*    <KonvaImage*/}
            {/*        image={image}*/}
            {/*        x={0}*/}
            {/*        y={0}*/}
            {/*        width={FieldStore.width}*/}
            {/*        height={FieldStore.height}*/}
            {/*    />}*/}
        </Layer>
    );
});

export default BackgroundLayer;