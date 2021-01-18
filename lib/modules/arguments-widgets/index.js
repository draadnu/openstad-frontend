const rp = require('request-promise');

module.exports = {
  extend: 'openstad-widgets',
  label: 'Arguments',
  alias: 'arguments',
  adminOnly: true,
  addFields: [
    {
      name: 'ideaId',
      type: 'string',
      label: 'Idea ID (if empty it will try to fetch the ideaId from the URL)',
    },
    {
      name: 'emptyPlaceholder',
      type: 'string',
      label: 'Text for no results',
      required: true
    },
    {
      name: 'replyingEnabled',
      type: 'boolean',
      label: 'Is replying to arguments allowed?',
      choices: [
          {
              value: true,
              label: "Yes"
          },
          {
              value: false,
              label: "No"
          },
      ]
    },
    {
      name: 'votingEnabled',
      type: 'boolean',
      label: 'Is voting for arguments allowed?',
      choices: [
          {
              value: true,
              label: "Yes"
          },
          {
              value: false,
              label: "No"
          },
      ]
    },
    {
      name: 'argumentSentiment',
      type: 'select',
      choices: [
        {
          label: 'Voor',
          value: 'for',
        },
        {
          label: 'Tegen',
          value: 'against',
        },
      ]
    },
    {
      name: 'showLastNameForArguments',
      type: 'select',
      label: 'Show last name for arguments?',
      choices: [
        {
          label: 'Yes',
          value: 'yes'
        },
        {
          label: 'No, only for administrators',
          value: 'adminonly'
        },
        {
          label: 'No',
          value: 'no'
        }
      ],
      def: 'yes'
    },
    {
      name: 'showLastNameForReactions',
      type: 'select',
      label: 'Show last name for reactions?',
      choices: [
        {
          label: 'Yes',
          value: 'yes'
        },
        {
          label: 'No, only for administrators',
          value: 'adminonly'
        },
        {
          label: 'No',
          value: 'no'
        }
      ],
      def: 'yes'
    },
  ],
  construct: function(self, options) {
     const superPushAssets = self.pushAssets;
     //const auth = "Basic " + new Buffer("xxx:xxx#").toString("base64");

     self.pushAssets = function() {
       superPushAssets();
       self.pushAsset('script', 'main', { when: 'always' });
       self.pushAsset('stylesheet', 'main', { when: 'always' });
     };
     const superLoad = self.load;
      self.load = function (req, widgets, next) {
          const globalData = req.data.global;
          const siteConfig = req.data.global.siteConfig;
          widgets.forEach(function (widget) {
            
            console.log ('widget ideaId', widget.ideaId);
            
            if (widget.ideaId) {
              
              const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
              const headers = {
                'Accept': 'application/json',
              };
              
              var options = {
                uri: `${apiUrl}/api/site/${globalData.siteId}/idea/${widget.ideaId}?includeUser=1&includeVoteCount=1&includeUserVote=1&includeArguments=1&includeTags=1`,
                headers: headers,
                json: true // Automatically parses the JSON string in the response
              };
        
              const idea = req.data.ideas ? req.data.ideas.filter(function (idea) { return idea.id == widget.ideaId}) : [];
              
              console.log ('idea?', idea, widget.argumentSentiment);
              
              if (idea) {
                if (idea[0].argumentsAgainst && widget.argumentSentiment == 'against') {
                  widget.arguments = idea[0].argumentsAgainst;
                }
      
                if (idea[0].argumentsFor && widget.argumentSentiment == 'for') {
                  widget.arguments = idea[0].argumentsFor;
                }
              } else {
                widget.ajaxError = `Plan met ID #${widget.ideaId} bestaat niet`;
              }
              
             }
            });
        
          return superLoad(req, widgets, next);
      };

     var superOutput = self.output;
     self.output = function(widget, options) {
       return superOutput(widget, options);
     };

     self.addHelpers({
        showLastName: function (type, widget, user) {
          
          if (!user.lastName || user.lastName == 'null' || user.lastName === null) {
            user.lastName = '';
          }
          
            if (type == 'reactions' && (widget.showLastNameForReactions == 'yes' || (widget.showLastNameForReactions == 'adminonly' && user.role == 'admin'))) {
                return user.lastName;
            } else if (type == 'arguments' && (widget.showLastNameForArguments == 'yes' || (widget.showLastNameForArguments == 'adminonly' && user.role == 'admin'))) {
                return user.lastName;
            }

            return '';
        }
     });
   },


};
