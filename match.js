const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('pong', { id: req.query.id });
});



module.exports = router;
