function NonUniqueNonPositive(l) {
    l.sort()
    var ans = []
    for (let i=0; i<l.length-1; i++) {
        if (l[i] == l[i+1]) {
            ans.push(l[i])
        }
    }
    for (let i=0; i<l.length; i++) {
        if (l[i] <= 0) {
            ans.push(l[i])
        }
    }
    return ans
}

export function find_bad_tanks(files_object, filenumber, newval) {
    var tanks= Object.keys(files_object)
        .map((file_key) => {
            if (file_key == filenumber) { //bandaid for future render of current onChange
                let x = files_object[file_key]
                x.tank = newval
                return x
            }
            return files_object[file_key]
        })
        .reduce((tank_numbers, file) => {
            if (typeof file.tank != "undefined") {
                tank_numbers.push(file.tank)
            }
            return tank_numbers
        }, [])
        return NonUniqueNonPositive(tanks)
}