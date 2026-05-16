export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      return res.status(400).json({ message: `Validation échouée : ${messages}` });
    }
    req.body = value; // remplace par les données validées (avec valeurs par défaut, conversions)
    next();
  };
}
