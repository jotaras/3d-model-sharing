export default function sortOrder(field, ascending) {
    if (ascending) {
        return function(a, b) {
            if (a[field] > b[field]) {
                return 1;
            } else if (a[field] < b[field]) {
                return -1;
            }
            return 0;
        };
    } else {
        return function(a, b) {
            if (a[field] < b[field]) {
                return 1;
            } else if (a[field] > b[field]) {
                return -1;
            }
            return 0;
        };
    }
}
