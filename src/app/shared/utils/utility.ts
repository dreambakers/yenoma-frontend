import { constants } from "src/app/app.constants";
import { environment } from '../../../environments/environment';

export class Utility {
  public static getPollUrl(poll) {
    return environment.production ?
            (constants.shortenerUrl + `/${poll.shortId}`) :
            (window.location.origin + `/p/${poll.shortId}`);
  }
}
