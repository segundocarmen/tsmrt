import { config, S3, CognitoIdentityCredentials } from 'aws-sdk'
import { v4 } from 'uuid'
import { createReadStream } from 'fs'
import rimraf from 'rimraf' //delete files
import AWS_CONFIG from 'config'
import { json } from 'body-parser'

let s3
const connect = require('connect')
const multipart = require('connect-multiparty')
const { join } = require('path')
const { region, bucket, cognitoId } = AWS_CONFIG.get('aws.s3')

export default connect()
    .use(multipart({ uploadDir: join(process.cwd(), 'uploads') }))
    .use(json())
    .use(async (req, res, next) => {
        try {
            res.setHeader('Content-Type', 'application/json')
            let { file } = req.files || {}
            let {  idCountry, idCollege } = req.body || {}
            let key = `temp/country/${idCountry}/college/${idCollege}/teacher/${v4()}.${file.originalFilename.split('.').pop()}`
            const stream = createReadStream(file.path)

            if (!s3) {
                config.update({
                    region: region,
                    credentials: new CognitoIdentityCredentials({ IdentityPoolId: cognitoId })
                })
                s3 = new S3()
            }

            const params =  { 
                Body: stream,
                Bucket: bucket,
                Key: key, 
                ACL: 'public-read'
            }
                
            s3.upload(params, (s3Err, data) => {
                if (s3Err)
                    next(s3Err)
                else {
                    if (file && file.path)
                        process.nextTick(() => {
                            rimraf(file.path, (err) => {
                                // if (err)
                                //     console.log('an error ocurred while deleting the file after upload:', err)
                                // else
                                //     console.log('file removed', file.path)
                            })
                        })
                    res.end(JSON.stringify(data))
                }
            })    
        } catch(error) {
            // console.log('responseError', error)
            res.statusCode = 500
            res.end(JSON.stringify({
                message: error.message,
                stack: error.stack
            }))
        }
        
    })
