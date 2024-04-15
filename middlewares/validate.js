const Joi = require('joi');

const validcheckoutform = (data)=>{
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        streetAddress: Joi.string().required(),
        country: Joi.string().required(),
        phone: Joi.number().required(),
        postcode: Joi.string().required(),
        city: Joi.string().required(),
    })

    return schema.validate(data)
}



module.exports.validcheckoutform = validcheckoutform
