import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NoContentError,
  NotFoundError,
  UnauthorizedError,
  UnknownError,
  GatewayTimeoutError,
  ConflictError
} from "../errors";

export default ({ $axios, store }, inject) => {
  $axios.onRequest(config => {
    const { token } = store.state.account.authentication;
    if (token) config.headers.common["Authorization"] = `bearer ${token}`;

    config.validateStatus = status => true;
    return config;
  });

  $axios.onResponse(response => {
    const { data, status } = response;

    switch (status) {
      case 200:
      case 201:
        return response;
      case 204:
        throw new NoContentError();
      case 400:
        throw new BadRequestError(data);
      case 401:
        throw new UnauthorizedError();
      case 403:
        throw new ForbiddenError();
      case 404:
        throw new NotFoundError(data);
      case 409:
        throw new ConflictError(data);
      case 500:
        throw new InternalServerError(data);
      case 504:
        throw new GatewayTimeoutError();
      default:
        throw new UnknownError(status, data);
    }
  });
};
