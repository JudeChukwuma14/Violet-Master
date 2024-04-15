const { v4: uuidv4 } = require('uuid');


const uniqueName = (imageName)=>{
    const fileExtension = imageName.split('.').pop();

    const newname = `${uuidv4()}.${fileExtension}`
    return newname
}

module.exports = {uniqueName}
