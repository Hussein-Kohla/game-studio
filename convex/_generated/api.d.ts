/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as game3 from "../game3.js";
import type * as game5 from "../game5.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as imposter from "../imposter.js";
import type * as imposterCategories from "../imposterCategories.js";
import type * as imposterData from "../imposterData.js";
import type * as prompts from "../prompts.js";
import type * as promptsData from "../promptsData.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as words from "../words.js";
import type * as wordsData from "../wordsData.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  game3: typeof game3;
  game5: typeof game5;
  http: typeof http;
  images: typeof images;
  imposter: typeof imposter;
  imposterCategories: typeof imposterCategories;
  imposterData: typeof imposterData;
  prompts: typeof prompts;
  promptsData: typeof promptsData;
  seed: typeof seed;
  users: typeof users;
  words: typeof words;
  wordsData: typeof wordsData;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
