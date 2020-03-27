const connection = require("../database/connection");

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;

    const [total] = await connection("incidents").count();

    const incidents = await connection("incidents")
      .join("ongs", "ong_id", "=", "incidents.ong_id")
      .limit(5)
      .offset((page - 1) * 5)
      .select([
        "incidents.*",
        "ongs.name",
        "ongs.email",
        "ongs.whatsapp",
        "ongs.city",
        "ongs.uf"
      ]);

    res.header("X-Total-Count", total["count(*)"]);
    return res.json(incidents);
  },

  async store(req, res) {
    const { title, description, value } = req.body;
    const { authorization: ong_id } = req.headers;

    const [id] = await connection("incidents").insert({
      title,
      description,
      value,
      ong_id
    });

    return res.json({ id });
  },

  async delete(req, res) {
    const { id } = req.params;
    const { authorization: ong_id } = req.headers;

    const incidents = await connection("incidents")
      .where("id", id)
      .select("ong_id")
      .first();

    if (incidents.ong_id !== ong_id) {
      return res.status(401).json({ error: "Not Permited" });
    }

    await connection("incidents")
      .where("id", id)
      .delete();

    return res.status(201).send();
  }
};
