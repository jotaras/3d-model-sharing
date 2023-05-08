import React, { useState } from 'react';
import compareBy from '../services/SortOrder';
import directionCaret from '../assets/icon-direction.svg';
import downCaret from '../assets/caret-down-icon.svg';
import upCaret from '../assets/caret-up-icon.svg';
import * as Constants from '../constants/Constants';

export default function useSortHook() {
    const [sortOption, setSortOption] = useState({parameter: '', ascending: true});

    const handleSortOptionChange = (newSortOption) => {
        if (newSortOption === sortOption.parameter) {
            setSortOption({
                parameter: newSortOption,
                ascending: !sortOption.ascending
            });
        } else {
            setSortOption({
                parameter: newSortOption,
                ascending: true
            });
        }
    };

    const displaySortChevrons = (cell) => {
        if (cell === sortOption.parameter) {
            if (sortOption.ascending) {
                return <img className = 'sort-icont' src = {downCaret} alt = {Constants.CARET_DOWN_ICON_IMAGE_ALT}></img>;
            } else {
                return <img className = 'sort-icont' src = {upCaret} alt = {Constants.CARET_UP_ICON_IMAGE_ALT}></img>;
            }
        }
        return <img className = 'sort-icont' src = {directionCaret} alt = {Constants.CARET_DIRECTION_ICON_IMAGE_ALT}></img>;
    };

    const sort = (array) => {
        if (sortOption.parameter) {
            array.sort(compareBy(sortOption.parameter, sortOption.ascending));
        }
    };

    return {sortOption, handleSortOptionChange, sort, displaySortChevrons};
}
