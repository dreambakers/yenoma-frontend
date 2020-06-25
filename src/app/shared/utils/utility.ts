import { constants } from "src/app/app.constants";

export class Utility {
  public static getPollUrl(poll) {
    return window.location.origin + `/p/${poll.shortId}`;
  }
}
