export default class Rgb {
  static #_colourKeywords;
  #red;
  #green;
  #blue;
  #_cssColorValues = { decimal: undefined, hexadecimal: undefined };
  #_luminance;

  /**
   * @param {number} red The Rgb's red value as an integer from 0 to 255.
   * @param {number} green The Rgb's green value as an integer from 0 to 255.
   * @param {number} blue The Rgb's blue value as an integer from 0 to 255.
   */
  constructor(red, green, blue) {
    this.#red = red;
    this.#green = green;
    this.#blue = blue;
  }

  /**
   * @returns {Rgb}
   */
  static random() {
    return new Rgb(...[...Array(3)].map(this.#randomComponent));
  }

  /**
   * @returns {number} An integer between 0 and 255.
   */
  static #randomComponent() {
    return Math.floor(Math.random() * 256);
  }

  /**
   * @returns {Object.<string,string[]>} An object mapping decimal \<color\>
   * values to an array of matching colour keywords.
   */
  static async #colourKeywords() {
    this.#_colourKeywords ||= await fetch(
      "./assets/data/colourKeywords.json",
    ).then((response) => response.json());
    return this.#_colourKeywords;
  }

  /**
   * @param {string} [format=decimal] The format of the \<color\> value -
   * decimal or hexadecimal.
   * @returns {string} A CSS \<color\> value for the Rgb in the given format.
   */
  cssColorValue(format = "decimal") {
    switch (format) {
      case "decimal":
        this.#_cssColorValues.decimal ||= `rgb(${this.#components().join(
          ", ",
        )})`;
        return this.#_cssColorValues.decimal;
      case "hexadecimal":
        if (!this.#_cssColorValues.hexadecimal) {
          const hexComponents = this.#components().map((component) =>
            component.toString(16).padStart(2, "0"),
          );
          this.#_cssColorValues.hexadecimal = `#${hexComponents.join("")}`;
        }
        return this.#_cssColorValues.hexadecimal;
    }
  }

  /**
   * @returns {string[]|undefined} An array of matching colour keywords if they
   * exist, otherwise undefined.
   */
  async colourKeywords() {
    return (await Rgb.#colourKeywords())[this.cssColorValue()];
  }

  /**
   * @returns {string} The Rgb formatted for the colour query param.
   */
  queryParam() {
    return this.#components().join(",");
  }

  /**
   * @returns {Rgb} An Rgb for black or white, whichever contrasts best with the
   * main colour.
   */
  maxContrastRgb() {
    const blackLuminance = 0.0;
    const whiteLuminance = 1.0;

    const blackContrast = (this.#luminance() + 0.05) / (blackLuminance + 0.05);
    const whiteContrast = (whiteLuminance + 0.05) / (this.#luminance() + 0.05);

    return blackContrast > whiteContrast
      ? new Rgb(0, 0, 0)
      : new Rgb(255, 255, 255);
  }

  /**
   * @returns {number[]} An array of the Rgb's red, green, and blue values as
   * integers from 0 to 255.
   */
  #components() {
    return [this.#red, this.#green, this.#blue];
  }

  /**
   * @returns {number} The Rgb's luminance as a floating point value from 0.0 to
   * 1.0.
   */
  #luminance() {
    if (!this.#_luminance) {
      const [rLuminance, gLuminance, bLuminance] = this.#components().map(
        (component) => {
          const fractionalComponent = component / 255.0;
          return fractionalComponent <= 0.04045
            ? fractionalComponent / 12.92
            : Math.pow((fractionalComponent + 0.055) / 1.055, 2.4);
        },
      );
      this.#_luminance =
        0.2126 * rLuminance + 0.7152 * gLuminance + 0.0722 * bLuminance;
    }

    return this.#_luminance;
  }
}
