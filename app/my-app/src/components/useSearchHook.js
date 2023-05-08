import { useState } from 'react';

export default function useSearchHook() {
    const [searchOption, setSearchOption] = useState('');

    const find = (array, ...fields) => {
        if (searchOption) {
            return array.filter(item => {
                return fields.some(field => item[field].toLowerCase().includes(searchOption));
            });
        }
        return array;
    };

    return {searchOption, setSearchOption, find};
}
