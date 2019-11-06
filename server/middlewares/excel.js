//const excel = require('@tismart/node-excel-export')
const excel = require('node-excel-export')

export const ExcelExpressMiddleware = (req, res, next) => {
    res.downloadExcel = function(filename, data, specification) {
        console.log('node-excel',req)
        data = [{
            'a': 1,
            'b': 2
        }]
        res.header('Content-Type', 'application/vnd.ms-excel;charset=latin1')
        res.header('Content-Disposition', `attachment; filename=${filename}.xlsx`)
        res.send(
            excel.buildExport([
                {
                    name: 'hoja1',
                    data,
                    specification
                }
            ])
        )
    }

    next()
}