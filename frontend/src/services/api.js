export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  async get() {
    const response = await fetch(this.baseUrl);
    return await response.json();
  }
}
