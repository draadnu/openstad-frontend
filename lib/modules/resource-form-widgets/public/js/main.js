// Idea form extensions
// --------------------
// Used by poster file upload and description editor to register
// a reference to each uploaded file. This reference list is used
// by the server to connect the correct image uploads to this idea.

// Todo: init files
// Todo: init images

// Todo set validation on each filepond field


var fieldsetElement = document.querySelector('.filepondFieldset');

var fieldsetElementFile = document.querySelector('.filepondFieldsetFile');

if (fieldsetElement || fieldsetElementFile) {

  FilePond.registerPlugin(FilePondPluginImagePreview);
  FilePond.registerPlugin(FilePondPluginFileValidateSize);
  FilePond.registerPlugin(FilePondPluginFileValidateType);
  FilePond.registerPlugin(FilePondPluginFilePoster);
  FilePond.registerPlugin(FilePondPluginImageExifOrientation);

  var filePondSettings = {
    // set allowed file types with mime types
    acceptedFileTypes: ['image/*'],
    allowFileSizeValidation: true,
    maxFileSize: '8mb',
    name: 'image',
    maxFiles: 5,
    allowBrowse: true,
    files: uploadedFiles,
    server: {
      process: '/image',
      fetch: '/fetch-image?img=',
      revert: null
    },
    labelIdle: "Sleep afbeelding(en) naar deze plek of <span class='filepond--label-action'>klik hier</span>",
    labelInvalidField: "Field contains invalid files",
    labelFileWaitingForSize: "Wachtend op grootte",
    labelFileSizeNotAvailable: "Grootte niet beschikbaar",
    labelFileCountSingular: "Bestand in lijst",
    labelFileCountPlural: "Bestanden in lijst",
    labelFileLoading: "Laden",
    labelFileAdded: "Toegevoegd", // assistive only
    labelFileLoadError: "Fout bij het uploaden",
    labelFileRemoved: "Verwijderd", // assistive only
    labelFileRemoveError: "Fout bij het verwijderen",
    labelFileProcessing: "Laden",
    labelFileProcessingComplete: "Afbeelding geladen",
    labelFileProcessingAborted: "Upload cancelled",
    labelFileProcessingError: "Error during upload",
    labelFileProcessingRevertError: "Error during revert",
    labelTapToCancel: "tap to cancel",
    labelTapToRetry: "tap to retry",
    labelTapToUndo: "tap to undo",
    labelButtonRemoveItem: "Verwijderen",
    labelButtonAbortItemLoad: "Abort",
    labelButtonRetryItemLoad: "Retry",
    labelButtonAbortItemProcessing: "Verwijder",
    labelButtonUndoItemProcessing: "Undo",
    labelButtonRetryItemProcessing: "Retry",
    labelButtonProcessItem: "Upload"
  };

  var pond = FilePond.create(fieldsetElement, filePondSettings);

  var sortableInstance;

  var pondEl = fieldsetElement.querySelector('.filepond--root');
}

$(document).ready(function () {
  var ideaForm = document.getElementById('js-form');

  const dropFiles = document.querySelectorAll('.file-filepond');

  dropFiles.forEach(function(dropFile) {
    var key = dropFile.getAttribute('data-key');
    FilePond.create(dropFile, {
      acceptedFileTypes: ['application/*'],
      name: 'files['+ key +']',
      allowFileSizeValidation: true,
      maxFileSize: '8mb',
      maxFiles: 5,
      allowBrowse: true,
      files: uploadedDropFiles[key],
      server: {

        process: function(fieldName, file, metadata, load, error, progress, abort, transfer, options) {

          // fieldName is the name of the input field
          // file is the actual file object to send
          var formData = new FormData();
          formData.append('file', file, file.name);

          var request = new XMLHttpRequest();
          request.open('POST', '/file');

          // Should call the progress method to update the progress to 100% before calling load
          // Setting computable to false switches the loading indicator to infinite mode
          request.upload.onprogress = function(e) {
            progress(e.lengthComputable, e.loaded, e.total);
          };

          // Should call the load method when done and pass the returned server file id
          // this server file id is then used later on when reverting or restoring a file
          // so your server knows which file to return without exposing that info to the client
          request.onload = function() {
            if (request.status >= 200 && request.status < 300) {
              // the load method accepts either a string (id) or an object
              load(request.responseText);
            }
            else {
              // Can call the error method if something is wrong, should exit after
              error('oh no');
            }
          };

          request.send(formData);

          // Should expose an abort method so the request can be cancelled
          return {
            abort: function() {
              // This function is entered if the user has tapped the cancel button
              request.abort();

              // Let FilePond know the request has been cancelled
              abort();
            }
          };
        },

        // fetch: '/fetch-image?img=',
        // revert: null
      },
      labelIdle: "Sleep bestand(en) naar deze plek of <span class='filepond--label-action'>klik hier</span>",
      labelInvalidField: "Field contains invalid files",
      labelFileWaitingForSize: "Wachtend op grootte",
      labelFileSizeNotAvailable: "Grootte niet beschikbaar",
      labelFileCountSingular: "Bestand in lijst",
      labelFileCountPlural: "Bestanden in lijst",
      labelFileLoading: "Laden",
      labelFileAdded: "Toegevoegd", // assistive only
      labelFileLoadError: "Fout bij het uploaden",
      labelFileRemoved: "Verwijderd", // assistive only
      labelFileRemoveError: "Fout bij het verwijderen",
      labelFileProcessing: "Laden",
      labelFileProcessingComplete: "Bestand geladen",
      labelFileProcessingAborted: "Upload cancelled",
      labelFileProcessingError: "Error during upload",
      labelFileProcessingRevertError: "Error during revert",
      labelTapToCancel: "tap to cancel",
      labelTapToRetry: "tap to retry",
      labelTapToUndo: "tap to undo",
      labelButtonRemoveItem: "Verwijderen",
      labelButtonAbortItemLoad: "Abort",
      labelButtonRetryItemLoad: "Retry",
      labelButtonAbortItemProcessing: "Verwijder",
      labelButtonUndoItemProcessing: "Undo",
      labelButtonRetryItemProcessing: "Retry",
      labelButtonProcessItem: "Upload"
    });
  });
  var pondEl = fieldsetElement.querySelector('.filepond--root');
  if (ideaForm && fieldsetElement) {

    // check if files are being uploaded
    $.validator.addMethod("validateFilePondProcessing", function() {
      var files = pond ? pond.getFiles() : [];
      var pondFileStates =  FilePond.FileStatus;

      var processingFiles = files.filter(function (file) {
        return file.status !== pondFileStates.PROCESSING_COMPLETE;
      });

      return processingFiles.length === 0;
    }, "Plaatjes zijn nog aan het uploaden.");

    $.validator.addMethod("validateFilePond", function() {

        if ($('.filepondImage').length > 0 && pond.required) {
          var files = pond ? pond.getFiles() : [];
          var pondFileStates =  FilePond.FileStatus;

          files = files.filter(function (file) {
            return file.status === pondFileStates.PROCESSING_COMPLETE;
          });

          return files && files.length > 0;
        } else {
          return true;
        }

    }, "Eén of meerdere plaatjes zijn verplicht.");

    $.validator.addMethod("minLengthWithoutHTML", function(val, el, params) {
      var mainEditor  = document.getElementById('js-editor');
      var lengthOfChars = stripHTML(mainEditor.innerHTML).length;
      return lengthOfChars >= params;
    }, "Minimaal {0} tekens.");

    pond.on('FilePond:addfile', function(e) {
      if (sortableInstance) {
        $("ul.filepond--list").sortable('refresh');
      } else {
        sortableInstance = true;
        $("ul.filepond--list").sortable();
      }

      //  validator.element($('input[name=validateImages]'))
    });

    pond.on('FilePond:processfile', function(e) {
      validator.element($('input[name=validateImages]'))
    });
  }

  if (ideaForm) {

    var validator = $(ideaForm).validate({
      ignore: '',
      rules: {
        ignore: [],
        //      location: {
        //        required: true
        //      },
        title : {
          required: true,
          minlength: titleMinLength,
          maxlength: titleMaxLength,
        },
        summary : {
          minlength: summaryMinLength,
          maxlength: summaryMaxLength,
        },
        description : {
          required: true,
          minlength: descriptionMinLength,
          maxlength: descriptionMaxLength,
        },
        validateImages: {
          validateFilePond: true,
          validateFilePondProcessing: true
        },
        /*    description: {
              minLengthWithoutHTML: 140
            }*/
      },
      submitHandler: function(form, event) {
        console.log(event);
        $(form).find('input[type="submit"]').val('Verzenden...');
        $(form).find('input[type="submit"]').attr('disabled', true);

        var submitType = $(form).find('input[type="submit"]').data('submit-type');
        var data = $(form);
        console.log(form);
        console.log(submitType);
        data.status = submitType;

        $.ajax({
          url: $(form).attr('action'),
          //  context: document.body,
          type: 'POST',
          data: data.serialize(),
          dataType: 'json',
          success:function(response) {
            var redirect = $(form).find('.form-redirect-uri').val();
            redirect = redirect.replace(':id', response.id);
            window.location.replace(redirect);
          },
          error:function(response) {
            // "this" the object you passed
            alert(response.responseJSON.msg);
            $(form).find('input[type="submit"]').val('Opslaan');
            $(form).find('input[type="submit"]').attr('disabled', false);
          },

        });
        return false;
        //form.submit();
      },
      errorPlacement: function(error, element) {
        if (element.attr("type") === "radio" || element.attr("type") === "checkbox") {
          var elementContainer = $(element).closest('.form-field-container')
          error.insertAfter(elementContainer);
        } else {
          error.insertAfter(element);
        }
      },
      invalidHandler: function(form, validator) {

        if (!validator.numberOfInvalids()) {
          return;
        }

        var $firstErrorEl = $(validator.errorList[0].element).closest('.form-group');
        if ($firstErrorEl.length > 0) {
          var scrollOffset = parseInt($firstErrorEl.offset().top, 10);
          scrollOffset = scrollOffset;// - 1200;

          $('html, body').scrollTop(scrollOffset);
        }

      }
    });

    $('#locationField').on('change', function () {
      validator.element($(this))
    });
  }
});

// characters counters ------------------------------

function initCharsLeftInfo(target, contentDiv, minLen, maxLen, isHTML) {

  if (!contentDiv) {
    return;
  }

  var msg = {
    min: contentDiv.querySelector('div.min'),
    max: contentDiv.querySelector('div.max')
  };
  var span = {
    min: msg.min.querySelector('span'),
    max: msg.max.querySelector('span')
  };

  updateCharsLeftInfo(isHTML);

  target.addEventListener('focus', function( event ) {
    contentDiv.className += ' visible';
  });

  target.addEventListener('blur', function( event ) {
    contentDiv.className = contentDiv.className.replace(' visible', '');
  });

  target.addEventListener('keyup', function() {
    updateCharsLeftInfo(isHTML);
  });

  if (isHTML) {
    target.addEventListener('change', function() {
      updateCharsLeftInfo(isHTML);
    });
  }

  function updateCharsLeftInfo(isHTML) {
    var value = target.value || '';
    value = value.trim();

    if (isHTML) { // strip html
      var tmp = document.createElement("DIV");
      tmp.innerHTML = value;
      value = tmp.textContent || tmp.innerText || "";
    }

    var num_newlines = value.split(/\r\n|\r|\n/).length - 1;
    var len = value.length + num_newlines;

    var enable  = len < minLen ? 'min' : 'max';
    var disable = enable == 'max' ? 'min' : 'max';
    var ok = enable == 'max' ? len < maxLen : len > minLen;
    var chars   = len < minLen ?
      minLen - len :
      maxLen - len;

    msg[enable].className  = enable + ' ' + ( ok ? 'ok' : 'error' ) + ' visible';
    msg[disable].className = disable;
    span[enable].innerHTML = chars;
  }

}

window.addEventListener('load', function() {

  // title
  var textarea  = document.querySelector('textarea[name="title"]') || document.querySelector('input[name="title"]');
  var charsLeft = document.querySelector('#charsLeftTitle');
  if (textarea && charsLeft) initCharsLeftInfo(textarea, charsLeft, titleMinLength, titleMaxLength);

  // summary
  var textarea  = document.querySelector('textarea[name="summary"]') || document.querySelector('input[name="summary"]');
  var charsLeft = document.querySelector('#charsLeftSummary');
  if (textarea && charsLeft) initCharsLeftInfo(textarea, charsLeft, summaryMinLength, summaryMaxLength);

  // description
  var textarea  = document.querySelector('textarea[name="description"]') || document.querySelector('#js-editor');
  var charsLeft = document.querySelector('#charsLeftDescription');
  if (textarea && charsLeft) initCharsLeftInfo(textarea, charsLeft, descriptionMinLength, descriptionMaxLength, true);

  // add dynamic fields if exist
  $('.chars-counter').each(function () {
    var $inputEl = $(this);
    var minChar = $inputEl.attr('minlength');
    var maxChar = $inputEl.attr('maxlength');
    var $charsLeft = $inputEl.siblings('.charsLeft');

    initCharsLeftInfo($inputEl.get(0), $charsLeft.get(0), minChar, maxChar, true);
  })

  var $inputsAndSelects = $('#formulier-block input, #formulier-block select');

  if ($inputsAndSelects && $inputsAndSelects.length) {

    $inputsAndSelects.on('keydown', function (e) {
      if (e.key === "Enter") {
        var $nextGroup = $(this).closest('div').next('div');

        e.preventDefault();

        if ($nextGroup) {
          $nextGroup.find('input,select,textarea').first().focus();
          return false;
        } else {
          return $(this).closest('form').submit();
        }
      }
    })

  }

});

// einde characters counters ------------------------------







/*

FilePond.parse(document.body, {
  name: 'files',
});
*/
