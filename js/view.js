import {buildEventTarget} from '../../mazejs/web/js/utils.js';
export const
    EVENT_MAZE_SHAPE_SELECTED = 'mazeShapeSelected',
    EVENT_SIZE_PARAMETER_CHANGED = 'mazeSizeParameterChanged',
    EVENT_ALGORITHM_SELECTED = 'algorithmSelected',
    EVENT_GO_BUTTON_CLICKED = 'goButtonClicked',
    EVENT_SHOW_MAP_BUTTON_CLICKED = 'showDistanceMapButtonClicked',
    EVENT_CLEAR_MAP_BUTTON_CLICKED = 'clearDistanceMapButtonClicked',
    EVENT_CREATE_MASK_BUTTON_CLICKED = 'createMaskButtonClicked',
    EVENT_SAVE_MASK_BUTTON_CLICKED = 'saveMaskButtonClicked',
    EVENT_CLEAR_MASK_BUTTON_CLICKED = 'clearMaskButtonClicked',
    EVENT_FINISH_RUNNING_BUTTON_CLICKED = 'finishRunningButtonClicked',
    EVENT_WINDOW_RESIZED = 'windowResized',
    EVENT_MAZE_CLICK = 'mazeClick';
import {EVENT_CLICK} from '../../mazejs/web/js/drawingSurfaces.js';
import {STATE_INIT, STATE_DISPLAYING, STATE_PLAYING, STATE_MASKING, STATE_DISTANCE_MAPPING, STATE_RUNNING_ALGORITHM} from './stateMachine.js';

export function buildView(model, stateMachine) {
    "use strict";

    const eventTarget = buildEventTarget('view'),
        elCanvas = document.getElementById('maze'),
        elMazeContainer = document.getElementById('mazeContainer'),
        elGoButton = document.getElementById('go'),
        elShowDistanceMapButton = document.getElementById('showDistanceMap'),
        elClearDistanceMapButton = document.getElementById('clearDistanceMap'),
        elCreateMaskButton = document.getElementById('createMask'),
        elSaveMaskButton = document.getElementById('saveMask'),
        elClearMaskButton = document.getElementById('clearMask'),
        elFinishRunningButton = document.getElementById('finishRunning'),
        elInfo = document.getElementById('info'),
        elSizeParameterList = document.getElementById('sizeParameters'),
        elMazeShapeList = document.getElementById('shapeSelector'),
        elMazeAlgorithmList = document.getElementById('algorithmSelector');
        // elRefreshButton = document.getElementById('refreshMaze'),
        // elChangeMazeConfigButton = document.getElementById('changeMazeConfig'),
        // elPlayButton = document.getElementById('play'),
        // elApplyMaskToggle = document.getElementById('applyMaskToggle'),
        // elMaskNotSupported = document.getElementById('maskNotSupported'),
        // elApplyMask = document.getElementById('applyMask'),
        // elDetails = document.getElementById('details'),
        // elQuitButton = document.getElementById('quit'),
        // elSolutionButton = document.getElementById('solution'),
        // elDownloadButton = document.getElementById('downloadMaze'),
        //
        // imgPlayer = new Image(),
        // imgExit = new Image(),

    elGoButton.onclick = () => {
        const allParametersValid = [...elSizeParameterList.querySelectorAll('input')].every(el => el.checkValidity());
        if (allParametersValid) {
            eventTarget.trigger(EVENT_GO_BUTTON_CLICKED);
        } else {
            alert('bad params'); //TODO
        }
    };

    elShowDistanceMapButton.onclick = () => eventTarget.trigger(EVENT_SHOW_MAP_BUTTON_CLICKED);
    elClearDistanceMapButton.onclick = () => eventTarget.trigger(EVENT_CLEAR_MAP_BUTTON_CLICKED);
    elCreateMaskButton.onclick = () => eventTarget.trigger(EVENT_CREATE_MASK_BUTTON_CLICKED);
    elSaveMaskButton.onclick = () => eventTarget.trigger(EVENT_SAVE_MASK_BUTTON_CLICKED);
    elClearMaskButton.onclick = () => eventTarget.trigger(EVENT_CLEAR_MASK_BUTTON_CLICKED);
    elFinishRunningButton.onclick = () => eventTarget.trigger(EVENT_FINISH_RUNNING_BUTTON_CLICKED);

    function fitCanvasToContainer() {
        elCanvas.width = elMazeContainer.clientWidth;
        elCanvas.height = elMazeContainer.clientHeight;
    }
    window.onresize = () => {
        fitCanvasToContainer();
        eventTarget.trigger(EVENT_WINDOW_RESIZED);
    };
    fitCanvasToContainer();

    function toggleElementVisibility(el, display) {
        el.style.display = display ? 'block' : 'none';
    }

    return {
        // Shape
        addShape(shapeName) {
            const elMazeShapeItem = document.createElement('li');
            elMazeShapeItem.innerHTML = shapeName;
            elMazeShapeItem.onclick = () => eventTarget.trigger(EVENT_MAZE_SHAPE_SELECTED, shapeName);
            elMazeShapeList.appendChild(elMazeShapeItem);
            elMazeShapeItem.dataset.value = shapeName;
        },
        setShape(shapeName) {
            [...elMazeShapeList.querySelectorAll('li')].forEach(el => {
                el.classList.toggle('selected', el.dataset.value === shapeName);
            });
        },

        // Size
        clearSizeParameters() {
            elSizeParameterList.innerHTML = '';
        },
        addSizeParameter(name, minimumValue, maximumValue) {
            const elParameterItem = document.createElement('li'),
                elParameterName = document.createElement('label'),
                elParameterValue = document.createElement('input');

            elParameterName.innerHTML = name;

            elParameterValue.setAttribute('type', 'number');
            elParameterValue.setAttribute('required', 'required');
            elParameterValue.setAttribute('min', minimumValue);
            elParameterValue.setAttribute('max', maximumValue);
            elParameterValue.oninput = () => eventTarget.trigger(EVENT_SIZE_PARAMETER_CHANGED, {
                name,
                value: Number(elParameterValue.value)
            });
            elParameterValue.dataset.value = name;

            elParameterItem.appendChild(elParameterName);
            elParameterItem.appendChild(elParameterValue);
            elSizeParameterList.appendChild(elParameterItem);
        },
        setSizeParameter(name, value) {
            const elParamInput = [...elSizeParameterList.querySelectorAll('input')].find(el => el.dataset.value === name);
            elParamInput.value = value;
        },

        // Algorithm
        clearAlgorithms() {
            elMazeAlgorithmList.innerHTML = '';
        },
        addAlgorithm(description, algorithmId) {
            const elAlgorithmItem = document.createElement('li');
            elAlgorithmItem.innerHTML = description;
            elAlgorithmItem.onclick = () => eventTarget.trigger(EVENT_ALGORITHM_SELECTED, algorithmId);
            elMazeAlgorithmList.appendChild(elAlgorithmItem);
            elAlgorithmItem.dataset.value = algorithmId;
        },
        setAlgorithm(algorithmId) {
            [...elMazeAlgorithmList.querySelectorAll('li')].forEach(el => {
                el.classList.toggle('selected', el.dataset.value === algorithmId);
            });
        },

        updateForNewState(state) {
            toggleElementVisibility(elMazeShapeList,     [STATE_INIT, STATE_DISPLAYING].includes(state));
            toggleElementVisibility(elMazeAlgorithmList, [STATE_INIT, STATE_DISPLAYING].includes(state));
            toggleElementVisibility(elSizeParameterList, [STATE_INIT, STATE_DISPLAYING].includes(state));
            toggleElementVisibility(elGoButton,          [STATE_INIT, STATE_DISPLAYING].includes(state));
            toggleElementVisibility(elCreateMaskButton,  [STATE_INIT, STATE_DISPLAYING].includes(state));

            toggleElementVisibility(elShowDistanceMapButton, [STATE_DISPLAYING].includes(state));

            toggleElementVisibility(elClearDistanceMapButton, [STATE_DISTANCE_MAPPING].includes(state));

            toggleElementVisibility(elSaveMaskButton, [STATE_MASKING].includes(state));
            toggleElementVisibility(elClearMaskButton, [STATE_MASKING].includes(state));
            toggleElementVisibility(elFinishRunningButton, [STATE_RUNNING_ALGORITHM].includes(state));

            switch(state) {
                case STATE_INIT:
                    this.showInfo('Select parameters for your maze and then click <b>GO</b>');
                    break;
                case STATE_DISPLAYING:
                    this.showInfo('Click <b>GO</b> to generate a different maze');
                    break;
                case STATE_DISTANCE_MAPPING:
                    this.showInfo('Click somewhere in the maze to generate a distance map for that location.<br><br>Cells are coloured according to how difficult they are to reach from your chosen point.');
                    break;
                case STATE_PLAYING:
                case STATE_RUNNING_ALGORITHM:
                    this.showInfo('');
                    break;
                case STATE_MASKING:
                    this.showInfo('Define a mask by selecting cells from the grid.<br><br>Masked cells will not be included in your maze');
                    break;
                default:
                    console.assert(false, 'unexpected state value: ' + state);
            }
        },

        showInfo(msg) {
            elInfo.innerHTML = msg;
        },

        on(eventName, handler) {
            eventTarget.on(eventName, handler);
        }
    };
}