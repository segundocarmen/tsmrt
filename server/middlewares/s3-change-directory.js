import { S3 } from 'aws-sdk'
import connect from 'connect'
import { json } from 'body-parser'
import config from 'config'

const { region, bucket, cognitoId } = config.get('aws.s3')

export default connect()
    .use(json())
    .use((req, res, next) => {
        let { key, url } = req.body || {}
        let s3 = new S3()
        let copySourceUrl = key
        let imageName = key.split('/').pop()
        let destinationUrl = `${url}/${imageName}`
        console.log('destinationUrl', destinationUrl )
        if(destinationUrl && destinationUrl.length) {
            try {
                s3.copyObject({
                    Bucket: bucket,
                    CopySource: `${bucket}/${copySourceUrl}`,
                    Key: destinationUrl,
                    ACL: 'public-read' 
                },
                (s3Err, data) => {
                    if(s3Err) {
                        // console.log('on copyObject', s3Err)
                        throw s3Err
                    }
                    // console.log('copy data', data)
                    if(!key) 
                        throw new Error('¡Se necesita el key para poder eliminar el archivo!')
                    s3.deleteObject({
                            Bucket: bucket,
                            Key: key
                        }, 
                        (s3Err, data ) => {
                            if (s3Err) {
                                // console.log('delete failed', s3Err)
                                throw (s3Err)
                            }
                            // console.log('file removed from s3', data)
                        }
                    )
                    res.end(JSON.stringify(data))
                })
            } catch(error) {
                // console.log('responseError', error)
                res.statusCode = 500
                res.end(JSON.stringify({
                    message: error.message,
                    stack: error.stack
                }))
            }
        }

    })