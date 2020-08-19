const { generateCsv, getVotes } = require('./vote-overview');

module.exports = async function(self, options) {

    self.apos.app.get('/plan/votes/download/:ideaId', async function(req, res, next) {
<<<<<<< HEAD
        
        if (!req.params.ideaId) {
            res.redirect(req.header('Referer') || '/');
=======

        if (! req.params.ideaId) {
            return res.redirect(req.header('Referer') || '/');
>>>>>>> 3f63f7b81ab37645157e8fc72079c5a3e0289519
        }

        try {
            const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
            const votes = await getVotes(req, req.params.ideaId, apiUrl);
            const csv = generateCsv(votes);

            const date = new Date();
            const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
            
            res.contentType('text/csv');
            res.header('Content-Disposition', `attachment; filename="Stemoverzicht van plan #${req.params.ideaId} op ${formattedDate}.csv"`);
            return res.send(Buffer.from(csv));

        } catch (error) {
            console.error(error);
            res.redirect(req.header('Referer') || '/');
        }
    });
};
