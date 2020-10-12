const rp = require('request-promise');
const styleSchema = require('../../../config/styleSchema.js').default;
const mapFormValidations = require('./mapFormValidations');

module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Form',
  addFields: [
    {
      type: 'string',
      name: 'formId',
      label: 'Form ID (used to match e-mail template)'
    },
    {
      type: 'string',
      name: 'title',
      label: 'Title',
    },
    {
      type: 'string',
      name: 'intro',
      label: 'Intro',
      textarea: true
    },
    {
      type: 'string',
      name: 'redirectUrl',
      label: 'Where do we redirect the user after a successful submission?'
    },
    {
      type: 'boolean',
      name: 'linkedToIdea',
      label: 'Is this form linked to an idea (getting the ideaId from the url)',
      choices: [
        {
          value: true,
          label: "Yes",
          showFields: ['shouldSendEmailToIdeaUser']
        },
        {
          value: false,
          label: "No"
        },
      ],
    },
    {
      type: 'boolean',
      name: 'shouldSendEmailToIdeaUser',
      label: 'Send email to user of the linked idea.',
      choices: [
        {
          value: true,
          label: "Yes",
          showFields: ['userEmailTemplate', 'formHiddenText']
        },
        {
          value: false,
          label: "No"
        },
      ],

    },
    {
      type: 'string',
      name: 'userEmailTemplate',
      label: 'Email template for email to user of the idea',
    },
    {
      type: 'string',
      name: 'formHiddenText',
      label: 'Text to display when the user has submitted this idea',
    },
    {
      type: 'select',
      name: 'sendMail',
      label: 'Send confirmation mail',
      choices: [
        {
          label: 'Yes',
          value: 1
        },
        {
          label: 'No',
          value: 0
        }
      ]
    },
    {
      type: 'string',
      name: 'email',
      label: 'User Email field name (email input field for sending confirmation email to the user)'
    },
    {
      type: 'string',
      name: 'emailAdminTemplate',
      label: 'Email admin template'
    },
    {
      type: 'string',
      name: 'emailTemplate',
      label: 'Email template'
    },
    {
      type: 'string',
      name: 'emailSubject',
      label: 'Email subject user'
    },
    {
      type: 'string',
      name: 'emailSubjectAdmin',
      label: 'Email subject admin'
    },
    {
      name: 'formFields',
      label: 'Form fields',
      type: 'array',
      titleField: 'title',
      required: true,
      schema: [
        {
          type: 'string',
          name: 'title',
          label: 'Title'
        },
        {
          type: 'string',
          name: 'description',
          label: 'Beschrijving',
          textarea: true
        },
        {
          type: 'string',
          name: 'placeholder',
          label: 'Placeholder',
          textarea: true
        },
        {
          name: 'inputType',
          label: 'Type veld',
          type: 'select',
          choices: [
            {
              label: 'Multiple choice',
              value: 'multiple-choice',
            },
            {
              label: 'Text',
              value: 'text',
            },
            {
              label: 'Textarea',
              value: 'textarea',
            },
            {
              label: 'Image upload',
              value: 'image-upload',
            },
            {
              label: 'Locatie picker',
              value: 'location-picker',
            }
          ]
        },
        {
          name: 'choices',
          label: 'Keuzes (enkel voor multiple choice)',
          type: 'array',
          titleField: 'title',
          schema: [
            {
              name: 'image',
              type: 'attachment',
              label: 'Icon',
              required: false,
              trash: true
            },
            {
              type: 'string',
              name: 'title',
              label: 'Titel'
            },
            {
              type: 'string',
              name: 'value',
              label: 'Waarde'
            }
          ]
        },
        {
          type: 'string',
          name: 'inputKey',
          label: 'database name',
        },
        {
          type: 'string',
          name: 'validation',
          label: 'Validatie (Komma gescheiden, bv: required, minlength:20, maxlength:500)',
        },
        {
          type: 'string',
          name: 'options',
          label: 'Configuratie',
          textarea: true
        }
      ]
    },
    styleSchema.definition('containerStyles', 'Styles for the container')
  ],


  construct: function (self, options) {

    const superLoad = self.load;
    self.load = (req, widgets, callback) => {
      widgets.forEach((widget) => {
        if (widget.containerStyles) {
          const containerId = styleSchema.generateId();
          widget.containerId = containerId;
          widget.formattedContainerStyles = styleSchema.format(containerId, widget.containerStyles);
          widget.mappedValidation = mapFormValidations(widget.formFields);

          if(widget.linkedToIdea) {
            const ideaId = req.url
              .replace(/(\/.*\/)/, '')
              .replace(/\?.*/, '');

            widget.ideaId = ideaId;
            
            const idea = req.data.ideas ? req.data.ideas.find(idea => idea.id === parseInt(ideaId, 10)) : null;
            
            widget.hideForm = false;
            
            if (!idea || (idea && req.data.openstadUser && idea.userId == req.data.openstadUser.id && !req.data.isAdmin) || idea.status == 'DRAFT') {
              widget.hideForm = true;
            }
          }
          
          widget.getDisplayTitle = function (title) {
              if (/.*\*/.test(title)) {
                return /(.*)\*/.exec(title)[1]
              }
              
              return title;
            }
            
            widget.isFieldRequired = function (title) {
              return /.*\*/.test(title);
            }
            
            widget.replacePlaceholderVariables = function (placeholder) {
              
              if (!placeholder) {
                return '';
              }
              let gender = 'meneer/mevrouw ';
              
              const ideaId = req.url
              .replace(/(\/.*\/)/, '')
              .replace(/\?.*/, '');
              
              const idea = req.data.ideas ? req.data.ideas.find(idea => idea.id === parseInt(ideaId, 10)) : null;
              
              if (idea && idea.user) {
                if (idea.user.gender == 'male') {
                  gender = 'meneer ';
                } else if (idea.user.gender == 'female') {
                  gender = 'mevrouw ';
                }
  
                placeholder = placeholder.replace('{gender} ', gender);
                placeholder = placeholder.replace('{name}', idea.user.lastName);
              } else {
                placeholder = placeholder.replace('{gender} ', '');
                placeholder = placeholder.replace('{name}', 'meneer/mevrouw');
              }
              
              return placeholder;
            }
        }
      });

      return superLoad(req, widgets, callback);
    }

    var superPushAssets = self.pushAssets;
    self.pushAssets = function () {
      superPushAssets();
      self.pushAsset('stylesheet', 'main', {when: 'always'});
      self.pushAsset('script', 'filepond', {when: 'always'});
      self.pushAsset('script', 'init_filepond', {when: 'always'});
      self.pushAsset('script', 'main', {when: 'always'});
    };
    var formFields;

    var superOutput = self.output;
    self.output = function (widget, options) {
      formFields = widget.formFields;
      return superOutput(widget, options);
    };

    self.route('get', 'submissions', (req, res) => {
      if (!req.query || !req.query.form) {
        req.status(500).json({message: 'Formulier niet gevonden'});
      }

      const form = req.query.form;
      const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
      const siteId = req.data.global.siteId;
      
      console.log (apiUrl + `/api/site/${siteId}/submission/${form}`, 'FORM SUBMISSION URL');

      const options = {
        method: 'GET',
        uri: apiUrl + `/api/site/${siteId}/submission/${form}`,
        headers: {
          'Accept': 'application/json',
        },
        json: true // Automatically parses the JSON string in the response
      };

      rp(options)
        .then(function (response) {
          res.status(200).json(response);
        })
        .catch(function (err) {
          console.log (err, 'FORM SUBMISSION ERROR');
          res.status(500).json({message: 'Er ging iets fout bij het ophalen van de inzendingen. Probeer het aub. opnieuw.'});
        });
    });

    self.route('post', 'submit', (req, res) => {
      const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
      const appUrl = self.apos.settings.getOption(req, 'appUrl');

      const redirectUrl = (req.body.redirectUrl ? req.body.redirectUrl : req.header('Referer') || appUrl);
      const siteId = req.data.global.siteId;
      const body = {
        submittedData: {},
        titles: {}
      };

      var bodyData = req.body.data;

      // Fetch image from the request and set it in the correct input key
      if (req.body.image && req.body.imageInputKey) {
        var image = JSON.parse(req.body.image);
        bodyData[req.body.imageInputKey] = image.url;
      }

      body.submittedData = bodyData;
      body.titles = req.body.title;
      body.sendMail = req.body.sendMail;
      body.emailTemplate = req.body.emailTemplate;
      body.emailAdminTemplate = req.body.emailAdminTemplate;
      body.emailSubject = req.body.emailSubject;
      body.emailSubjectAdmin = req.body.emailSubjectAdmin;
      body.formId = req.body.formId;

      if(req.body.linkedToIdea) {
        body.ideaId = req.body.linkedToIdea;
        body.shouldSendEmailToIdeaUser = req.body.shouldSendEmailToIdeaUser;
        body.userEmailTemplate = req.body.shouldSendEmailToIdeaUser ? req.body.userEmailTemplate : null;
      }

      body.recipient = req.body.data && req.body.emailField && req.body.data[req.body.emailField] ? req.body.data[req.body.emailField] : null;

      let headers = {
        'Accept': 'application/json',
      };
      
      if (req.session.jwt) {
        headers['X-Authorization'] = 'Bearer ' + req.session.jwt;
      }
      
      const options = {
        method: 'POST',
        uri: apiUrl + `/api/site/${siteId}/submission`,
        headers: headers,
        body: body,
        json: true // Automatically parses the JSON string in the response
      };

      rp(options)
        .then(function (response) {
          res.status(200).json({
            url: redirectUrl
          });
        })
        .catch(function (err) {
          res.status(500).json({
            message: err
          });
        });

    });

  }
};
