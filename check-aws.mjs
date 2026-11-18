// Verifies that your AWS settings work. Run via setup.bat or:  node check-aws.mjs
import fs from "node:fs";

if (!fs.existsSync(".env.local")) {
  console.log("No .env.local found. Run setup.bat first.");
  process.exit(1);
}
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const region = process.env.REC_AWS_REGION ?? process.env.AWS_REGION;
const Bucket = process.env.S3_BUCKET;
const credentials = {
  accessKeyId: process.env.REC_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REC_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
};
if (!region || !Bucket || !credentials.accessKeyId || !credentials.secretAccessKey) {
  console.log("Some AWS values are empty in .env.local. Run setup.bat again.");
  process.exit(1);
}

const { S3Client, PutObjectCommand, GetObjectCommand } = await import("@aws-sdk/client-s3");
const { RekognitionClient, CreateCollectionCommand } = await import("@aws-sdk/client-rekognition");

const hint = (e) => {
  const n = e?.name ?? e?.Code ?? "";
  if (n === "NoSuchBucket") return "The bucket name is wrong, or the bucket was not created in this region.";
  if (/PermanentRedirect|AuthorizationHeaderMalformed/.test(n) || e?.$metadata?.httpStatusCode === 301)
    return "AWS_REGION does not match the region of your bucket.";
  if (n === "InvalidAccessKeyId") return "The Access key ID is wrong or was deleted.";
  if (n === "SignatureDoesNotMatch") return "The Secret access key is wrong.";
  if (/AccessDenied/.test(n)) return "The IAM user is missing permissions. Re-check the policy in AWS-SETUP.md (step 3).";
  return `${n}: ${e?.message ?? e}`;
};

let failed = false;

try {
  const s3 = new S3Client({ region, credentials });
  await s3.send(new PutObjectCommand({ Bucket, Key: "config/connection-check.txt", Body: "ok" }));
  await s3.send(new GetObjectCommand({ Bucket, Key: "config/connection-check.txt" }));
  console.log("OK   S3 bucket: can write and read.");
} catch (e) {
  failed = true;
  console.log("FAIL S3 bucket -", hint(e));
}

try {
  await new RekognitionClient({ region, credentials }).send(new CreateCollectionCommand({ CollectionId: "rec-connection-check" }));
  console.log("OK   Rekognition: face matching is available.");
} catch (e) {
  if (e?.name === "ResourceAlreadyExistsException") console.log("OK   Rekognition: face matching is available.");
  else {
    failed = true;
    console.log("FAIL Rekognition -", hint(e));
  }
}

console.log(failed ? "\nFix the items marked FAIL, then run setup.bat again." : "\nAll good. Browser uploads also need the CORS rule from AWS-SETUP.md (step 2).");
