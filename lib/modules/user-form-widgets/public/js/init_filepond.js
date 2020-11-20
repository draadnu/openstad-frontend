
function initFilePond() {
    var fieldsetElement = document.querySelector('.filepondUserformFieldset');
    
    if (fieldsetElement) {
        FilePond.registerPlugin(FilePondPluginImagePreview);
        FilePond.registerPlugin(FilePondPluginFileValidateSize);
        FilePond.registerPlugin(FilePondPluginFileValidateType);
        FilePond.registerPlugin(FilePondPluginFilePoster);
        FilePond.registerPlugin(FilePondPluginImageExifOrientation);
        
        var filePondSettings = {
            // set allowed file types with mime types
            acceptedFileTypes:              ['image/*'],
            allowFileSizeValidation:        true,
            maxFileSize:                    '8mb',
            name:                           'image',
            maxFiles:                       5,
            allowBrowse:                    true,
            files:                          [],
            server:                         {
                process: '/image',
                fetch:   '/fetch-image?img=',
                revert:  null
            },
            labelIdle:                      "Sleep afbeelding(en) naar deze plek of <span class='filepond--label-action'>klik hier</span>",
            labelInvalidField:              "Field contains invalid files",
            labelFileWaitingForSize:        "Wachtend op grootte",
            labelFileSizeNotAvailable:      "Grootte niet beschikbaar",
            labelFileCountSingular:         "Bestand in lijst",
            labelFileCountPlural:           "Bestanden in lijst",
            labelFileLoading:               "Laden",
            labelFileAdded:                 "Toegevoegd", // assistive only
            labelFileLoadError:             "Fout bij het uploaden",
            labelFileRemoved:               "Verwijderd", // assistive only
            labelFileRemoveError:           "Fout bij het verwijderen",
            labelFileProcessing:            "Laden",
            labelFileProcessingComplete:    "Afbeelding geladen",
            labelFileProcessingAborted:     "Upload cancelled",
            labelFileProcessingError:       "Error during upload",
            labelFileProcessingRevertError: "Error during revert",
            labelTapToCancel:               "tap to cancel",
            labelTapToRetry:                "tap to retry",
            labelTapToUndo:                 "tap to undo",
            labelButtonRemoveItem:          "Verwijderen",
            labelButtonAbortItemLoad:       "Abort",
            labelButtonRetryItemLoad:       "Retry",
            labelButtonAbortItemProcessing: "Verwijder",
            labelButtonUndoItemProcessing:  "Undo",
            labelButtonRetryItemProcessing: "Retry",
            labelButtonProcessItem:         "Upload",
            labelMaxFileSizeExceeded:       "Afbeelding is te groot, max grootte is 8MB"
        };
        
        
        FilePond.create(fieldsetElement, filePondSettings);
    }
    
    var fieldsetElement = document.querySelector('.filepondUserformFileFieldset');
    
    if (fieldsetElement) {
        FilePond.registerPlugin(FilePondPluginFileValidateSize);
        FilePond.registerPlugin(FilePondPluginFileValidateType);
        
        var filePondSettings = {
            // set allowed file types with mime types
            acceptedFileTypes:              ['application/*'],
            allowFileSizeValidation:        true,
            maxFileSize:                    '8mb',
            name:                           'file',
            maxFiles:                       5,
            allowBrowse:                    true,
            files:                          [],
            server:                         {
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
              labelInvalidField: "Ongeldige bestandstypes gevonden",
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
              labelFileProcessingComplete: "Succesvol geüpload",
              labelFileProcessingAborted: "Upload geannuleerd",
              labelFileProcessingError: "Fout opgetreden tijdens uploaden",
              labelFileProcessingRevertError: "Fout opgetreden tijdens terugdraaien",
              labelTapToCancel: "raak aan om te annuleren",
              labelTapToRetry: "raak aan om opnieuw te proberen",
              labelTapToUndo: "raak aan om ongedaan te maken",
              labelButtonRemoveItem: "Verwijderen",
              labelButtonAbortItemLoad: "Annuleren",
              labelButtonRetryItemLoad: "Probeer opnieuw",
              labelButtonAbortItemProcessing: "Verwijder",
              labelButtonUndoItemProcessing: "Ongedaan maken",
              labelButtonRetryItemProcessing: "Probeer opnieuw",
              labelButtonProcessItem: "Upload"
        };
        
        
        FilePond.create(fieldsetElement, filePondSettings);
    }
}
