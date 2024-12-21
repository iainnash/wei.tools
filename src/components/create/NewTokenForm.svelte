<script lang="ts">
  import { createForm } from "felte";
  import { reporter, ValidationMessage } from "@felte/reporter-svelte";

  export let onSubmit: (values: any) => any;
  export let actions: string[];
  export let header: string;

  const { form, isSubmitting } = createForm({
    extend: reporter,
    validate: (values) => {
      const errors: any = {};
      if (!values.name) {
        errors.name = ["Missing"];
      }
      if (!values.image) {
        errors.image = ["Missing"];
      }

      return errors;
    },
    onSubmit: onSubmit,
    onSuccess(response, context) {
      console.log("onSuccess", response, context);
    },
    onError(err, context) {
      console.log("onErr", err, context);
    },
  });
</script>

{#if !$isSubmitting}
  <form use:form>
    <h3>{header}</h3>

    <div>
      <label for="name">Name</label>
      <input type="text" name="name" />
      <ValidationMessage for="name" let:messages={message}>
        {#if message}
          <div>{message}</div>
        {/if}
      </ValidationMessage>
    </div>

    <div>
      <label for="description">Description</label>
      <textarea rows="3" name="description" />
      <ValidationMessage for="description" let:messages={message}>
        {#if message}
          <div>{message}</div>
        {/if}
      </ValidationMessage>
    </div>

    <div>
      <label for="image">Image</label>
      <input type="file" name="image" />
      <ValidationMessage for="image" let:messages={message}>
        {#if message}
          <div>{message}</div>
        {/if}
      </ValidationMessage>
    </div>

    <div>
      <label for="media">Media (optional)</label>
      <input type="file" name="media" />
      <ValidationMessage for="media" let:messages={message}>
        {#if message}
          <div>{message}</div>
        {/if}
      </ValidationMessage>
    </div>

    <div><button disabled={$isSubmitting} type="submit">Submit</button></div>
  </form>
{:else}
  <ul>
    {#each actions as action}
      <li>{action}</li>
    {/each}
  </ul>
{/if}

<style>
  form {
    max-width: 500px;
    margin: 2rem;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
  }

  form h3 {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }

  form div {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
  }

  form label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #555;
  }

  form input[type="text"],
  form input[type="file"],
  form textarea {
    font-family: Arial, sans-serif;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    color: #333;
    background-color: #fff;
  }

  form input[type="text"]:disabled {
    background-color: #eee;
  }

  form input[type="text"]:focus,
  form input[type="file"]:focus {
    border-color: #007bff;
    outline: none;
  }

  form button {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.3s;
  }

  form button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  form button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  form div > div {
    margin-top: 0.5rem;
    color: #d9534f;
    font-size: 0.875rem;
  }
</style>
