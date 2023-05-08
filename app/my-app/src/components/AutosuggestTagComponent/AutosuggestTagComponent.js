import React, {useState} from 'react';
import * as Constants from '../../constants/Constants';
import './AutosuggestTagComponent.css';

export default function AutosuggestTagComponent({chosenTags, setChosenTags, allTags}) {
    const [displayAutosuggest, setDisplayAutosuggest] = useState(false);
    const [tagFromInput, setTagFromInput] = useState('');
    const [tagError, setTagError] = useState('');

    const handleAddClick = () => {
        if (tagFromInput.length >= 15) {
            setTagError(Constants.TAG_LENGTH_ERROR_MESSAGE);
        } else if (tagFromInput && tagFromInput.trim() && !chosenTags.includes(tagFromInput)) {
            setChosenTags([...chosenTags, tagFromInput]);
            setTagFromInput('');
            setTagError('');
        }
    };

    return (
        <div className = 'autosuggest-wrapper'>
            <div className='input-tag-container' onBlur={() => setDisplayAutosuggest(false)}>
                <input type='text' className='input-tag' placeholder={Constants.FORM_INPUT_TAG_PLACEHOLDER} value={tagFromInput}
                    onFocus={() => setDisplayAutosuggest(true)}
                    onChange={(event) => setTagFromInput(event.target.value)} />
                {displayAutosuggest && <div className='autosuggest-container'>
                    {allTags
                        .filter(tag => tag.name.includes(tagFromInput))
                        .map((tag, index) => {
                            return (
                                <div key = {index} className = 'autosuggest-input' onMouseDown = {(event) => {
                                    event.preventDefault();
                                    if (!chosenTags.includes(tag.name)) {
                                        setChosenTags([...chosenTags, tag.name]);
                                    }
                                    setTagFromInput('');

                                }}>{tag.name}</div>
                            );
                        })}
                </div>}
            </div>
            <button type='button' className='add-tag-button' onClick={handleAddClick}>{Constants.FORM_ADD_TAG_BUTTON_TEXT}</button>
            <label className = 'validation-tag-errors'>{tagError}</label>
        </div>
    );
}
