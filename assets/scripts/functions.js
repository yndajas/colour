import Rgb from "./rgb.js";

/**
 * @param {string} queryParam The colour query param to check.
 * @returns {boolean} Whether the query param is valid.
 */
function queryParamIsValid(queryParam) {
  if (!/\d{1,3},\d{1,3},\d{1,3}/.test(queryParam)) return false;
  return queryParam
    ?.split(",")
    .every((component) => Number.parseInt(component, 10) <= 255);
}

/**
 * Updates the displayed colour keywords.
 * @param {string[]|undefined} newKeywords One or more matching colour keywords
 * for the new Rgb, if they exist.
 */
function updateColourKeywords(newKeywords) {
  Array.from(document.querySelectorAll(".colour-keyword")).forEach((div) =>
    div.remove(),
  );
  if (newKeywords) {
    const nodes = newKeywords.map((newKeyword) => {
      const fragment = document
        .querySelector("#colour-keyword-template")
        .content.cloneNode(true);
      fragment.querySelector("p").innerText = newKeyword;
      const button = fragment.querySelector("button");
      button.addEventListener("click", function (_event) {
        copyCode(button);
      });
      if (newKeywords.length > 1) {
        button.ariaLabel = `copy colour keyword (${newKeyword})`;
      }
      document
        .querySelector("main")
        .insertBefore(fragment, document.querySelector("#decimal-rgb"));
    });
  }
}

/**
 * Updates the favicon to a square filled using the given Rgb style.
 * @param {string} decimalRgbStyle A CSS \<color\> value to use for the
 * favicon's fill style.
 */
function updateFavicon(decimalRgbStyle) {
  const favicon = new Image();
  favicon.src = "";
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  context.drawImage(favicon, 0, 0);
  context.fillStyle = decimalRgbStyle;
  context.fillRect(0, 0, 32, 32);
  const linkMetaTag =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  linkMetaTag.type = "image/x-icon";
  linkMetaTag.rel = "shortcut icon";
  linkMetaTag.href = canvas.toDataURL("image/x-icon");
  document.querySelector("head").appendChild(linkMetaTag);
}

/**
 * Updates the query param (and adds to the history) without reloading the page.
 * @param {string} newQueryParam A colour query param.
 */
function updateQueryParam(newQueryParam) {
  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?colour=${newQueryParam}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
}

/**
 * Changes the colour by updating:
 * - the body's background, the favicon, the displayed CSS \<color\> values, and
 * the query param to the new colour;
 * - the text colour to whichever contrasts best out of black or white.
 * @param {Event} [event=undefined] A triggering event fired by clicking
 * anywhere other than a button or anchor element.
 * @param {Rgb} [newRgb=undefined] A specific Rgb to use for the new colour. If
 * unspecified, a random Rgb will be generated.
 */
async function changeColour(event = undefined, newRgb = undefined) {
  if (["A", "BUTTON"].includes(event?.target.nodeName)) return;

  newRgb ||= Rgb.random();
  document.body.style.backgroundColor = newRgb.cssColorValue();
  document.body.style.color = newRgb.maxContrastRgb().cssColorValue();
  document.querySelector("#decimal-rgb p").innerText = newRgb.cssColorValue();
  document.querySelector("#hexadecimal-rgb p").innerText =
    newRgb.cssColorValue("hexadecimal");
  updateFavicon(newRgb.cssColorValue());
  updateQueryParam(newRgb.queryParam());
  updateColourKeywords(await newRgb.colourKeywords());
}

/**
 * Copies to the clipboard the CSS \<color\> value from the sibling p of the
 * pressed button.
 * @param {HTMLButtonElement} button The HTMLButtonElement that was clicked on
 * to request the copy action.
 */
function copyCode(button) {
  const code = button.parentNode.querySelector("p").innerText;
  navigator.clipboard.writeText(code);
}

export { changeColour, copyCode, queryParamIsValid, updateFavicon };
