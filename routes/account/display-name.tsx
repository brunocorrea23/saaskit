// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Logo from "@/components/Logo.tsx";
import Head from "@/components/Head.tsx";
import {
  BUTTON_STYLES,
  INPUT_STYLES,
  NOTICE_STYLES,
} from "@/utils/constants.ts";
import {
  getOrCreateUser,
  getUserDisplayName,
  setUserDisplayName,
  type User,
} from "@/utils/db.ts";
import type { AccountState } from "./_middleware.ts";

interface DisplayNamePageData {
  user: User;
}

export const handler: Handlers<DisplayNamePageData, AccountState> = {
  async GET(_req, ctx) {
    const user = await getOrCreateUser(
      ctx.state.session.user.id,
      ctx.state.session.user.email!,
    );
    return ctx.render({ user });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const displayName = form.get("display_name");

    if (typeof displayName !== "string") {
      return new Response('"display_name must be a string"', { status: 400 });
    }

    try {
      await setUserDisplayName(ctx.state.session.user.id, displayName);
    } catch (error) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(null, {
      headers: { location: "/account" },
      status: 302,
    });
  },
};

export default function ResetPassword(props: PageProps<DisplayNamePageData>) {
  const errorMessage = props.url.searchParams.get("error");

  return (
    <>
      <Head title="Change display name" />
      <div class="max-w-xs flex h-screen m-auto">
        <div class="m-auto w-72">
          <a href="/">
            <Logo class="mb-8" />
          </a>
          <h1 class="text-center my-8 text-2xl font-bold">
            Change display name
          </h1>
          {errorMessage && <div class={NOTICE_STYLES}>{errorMessage}</div>}
          <form method="POST" class="space-y-4">
            <input
              type="text"
              value={getUserDisplayName(props.data.user)}
              placeholder="Display name"
              name="display_name"
              required
              class={INPUT_STYLES}
            />
            <button type="submit" class={`${BUTTON_STYLES} w-full`}>
              Update
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
