"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
// Generates a random key
const keyGenerator = () => {
    return `portalize_${Math.random().toString(36).substr(2, 16)}-${Math.random()
        .toString(36)
        .substr(2, 16)}-${Math.random().toString(36).substr(2, 16)}`;
};
// Custom hook that checks for uniqueness and retries if clashes
exports.useKey = () => {
    const usedKeys = React.useRef([]);
    const generateKey = () => {
        let foundUniqueKey = false;
        let newKey = '';
        let tries = 0;
        while (!foundUniqueKey && tries < 3) {
            // limit number of tries to stop endless loop of pain
            tries++;
            newKey = keyGenerator();
            if (!usedKeys.current.includes(newKey)) {
                foundUniqueKey = true;
            }
        }
        // will only run if exited while loop without finding a unique key
        if (!foundUniqueKey) {
            newKey = `portalize_${Date.now()}_${Math.floor(Math.random() * 1000)}`; // fallback method
        }
        usedKeys.current.push(newKey);
        return newKey;
    };
    // Removes our key to make it 'available' again
    const removeKey = (key) => {
        usedKeys.current = usedKeys.current.filter(k => k !== key);
    };
    return { generateKey, removeKey };
};
