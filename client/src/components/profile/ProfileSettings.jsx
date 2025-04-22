/* eslint-disable react/prop-types */
import { Formik } from "formik";
import TasksComponent from "../TasksComponent";
import * as yup from "yup";
import {
  Button,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Dropzone from "react-dropzone";
import { countriesWithFlags } from "../../../infoArrays";
import { Box, useTheme } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "../../../state";
import { useState } from "react";
import FlexBetween from "../FlexBetween";
import {
  DeleteOutline,
  Facebook,
  Instagram,
  LinkedIn,
  X,
  YouTube,
} from "@mui/icons-material";
import Cropper from "react-easy-crop";
import { cropImage } from "../../frequentFunctions";

const ProfileSettings = ({ setProfileSettings, setChangePassword }) => {
  const [usernameError, setUsernameError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropComplete, setCropComplete] = useState(null);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const mode = useSelector((state) => state.mode);

  const dispatch = useDispatch();

  const { palette } = useTheme();

  const initialValues = {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    gender: user.gender,
    birthdate: user.birthdate,
    bio: user.bio,
    location: user.location,
    occupation: user?.occupation,
    background: "",
    picturePath: "",
    facebook: user?.links?.facebook || "",
    instagram: user?.links?.instagram || "",
    x: user?.links?.x || "",
    linkedin: user?.links?.linkedin || "",
    youtube: user?.links?.youtube || "",
  };

  const schema = yup.object({
    firstName: yup
      .string()
      .min(2)
      .max(20)
      .matches(/^[a-zA-Z\u0600-\u06FF\s'-]+$/, "Invalid name")
      .required("required"),
    lastName: yup
      .string()
      .min(2)
      .max(20)
      .matches(/^[a-zA-Z\u0600-\u06FF\s'-]+$/, "Invalid name"),
    username: yup
      .string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .matches(/^[a-zA-Z][a-zA-Z0-9._]*$/, "Invalid username"),
    gender: yup.string().min(2).max(20).required("required"),
    birthdate: yup
      .string()
      .required("Birthdate is required")
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        "Birthdate must be in the format YYYY-MM-DD"
      )
      .test("is-valid-date", "Birthdate must be a valid date", (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .test(
        "is-logical-date",
        "Birthdate must be between 1900 and today",
        (value) => {
          const date = new Date(value);
          const minDate = new Date(1900, 0, 1);
          const maxDate = new Date();
          return date >= minDate && date <= maxDate;
        }
      ),
    bio: yup.string().max(101),
    location: yup.string().required("Please select a location"),
    occupation: yup
      .string()
      .max(50)
      .matches(
        /^\p{L}+(\s\p{L}+)*$/u,
        "You can just add alphabetic characters"
      ),
    background: yup
      .mixed()
      .notRequired()
      .test("fileType", "Unsupported file format", (value) => {
        return (
          !value ||
          (value &&
            ["image/jpeg", "image/png", "image/webp"].includes(value.type))
        );
      }),
    picturePath: yup
      .mixed()
      .notRequired()
      .test("fileType", "Unsupported file format", (value) => {
        return (
          !value ||
          (value &&
            ["image/jpeg", "image/png", "image/webp"].includes(value.type))
        );
      }),
    facebook: yup.string().url(),
    instagram: yup.string().url(),
    x: yup.string().url(),
    linkedin: yup.string().url(),
    youtube: yup.string().url(),
  });

  const handleFormSubmit = async (values, formFunctions) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("username", values.username);
    formData.append("birthdate", values.birthdate);
    formData.append("gender", values.gender);
    formData.append("bio", values.bio);
    formData.append("location", values.location);
    formData.append("occupation", values.occupation);
    formData.append("facebook", values.facebook);
    formData.append("instagram", values.instagram);
    formData.append("x", values.x);
    formData.append("linkedin", values.linkedin);
    formData.append("youtube", values.youtube);

    if (values.background) {
      formData.append("picture", values.background);
      formData.append("background", values.background.name);
    } else if (values.picturePath) {
      formData.append("picture", values.picturePath);
      formData.append("picturePath", values.picturePath.name);
    }

    try {
      const response = await fetch(
        `/api/users/${user._id}/${user.username}/edit`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        dispatch(setLogin({ user: data, token: token }));
        setUsernameError(false);
      } else if (data.message === "Username exists") {
        setUsernameError(true);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
      setProfileImagePreview(null);
      setBackgroundImagePreview(null);
      formFunctions.resetForm();
    }
  };

  return (
    <TasksComponent
      open={ProfileSettings}
      setOpen={setProfileSettings}
      description="Edit Profile"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => {
          return (
            <form
              style={{ display: "flex", flexDirection: "column", gap: "22px" }}
              onSubmit={handleSubmit}
            >
              <TextField
                label="First Name"
                onBlur={handleBlur}
                onChange={(e) => {
                  const trimmed = e.target.value
                    .trimStart()
                    .replace(/\s+/g, " ");
                  setFieldValue("firstName", trimmed);
                }}
                value={values.firstName}
                name="firstName"
                error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              <TextField
                label="Last Name"
                onBlur={handleBlur}
                onChange={(e) => {
                  const trimmed = e.target.value
                    .trimStart()
                    .replace(/\s+/g, " ");
                  setFieldValue("lastName", trimmed);
                }}
                value={values.lastName}
                name="lastName"
                error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                label="Username"
                onBlur={handleBlur}
                onChange={(e) => {
                  const trimmed = e.target.value.trim();
                  setFieldValue("username", trimmed);
                }}
                value={values.username}
                name="username"
                error={Boolean(touched.username) && Boolean(errors.username)}
                helperText={touched.username && errors.username}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              {usernameError && (
                <Typography
                  color="error"
                  m="-19px 0 -2px 0"
                  fontSize="12px"
                  whiteSpace="nowrap"
                >
                  the username already exists
                </Typography>
              )}

              <TextField
                label="Bio"
                multiline
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.bio}
                name="bio"
                error={Boolean(touched.bio) && Boolean(errors.bio)}
                helperText={touched.bio && errors.bio}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <TextField
                label="Occupation"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.occupation}
                name="occupation"
                error={
                  Boolean(touched.occupation) && Boolean(errors.occupation)
                }
                helperText={touched.occupation && errors.occupation}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <Box sx={{ gridColumn: "span 4" }}>
                <InputLabel>Gender</InputLabel>
                <Box display="flex" alignItems="center" gap="10px" my="10px">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="5px"
                    p="0 15px 0 20px"
                    border={`2px solid ${palette.neutral.medium}`}
                  >
                    <Typography>Male</Typography>

                    <Radio
                      name="gender"
                      value="male"
                      onChange={handleChange}
                      error={Boolean(touched.gender) && Boolean(errors.gender)}
                      labelId="gender-label"
                      checked={values.gender === "male" ? true : false}
                    />
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="5px"
                    p="0 15px 0 20px"
                    border={`2px solid ${palette.neutral.medium}`}
                  >
                    <Typography>Female</Typography>

                    <Radio
                      name="gender"
                      value="female"
                      onChange={handleChange}
                      error={Boolean(touched.gender) && Boolean(errors.gender)}
                      labelId="gender-label"
                      checked={values.gender === "female" ? true : false}
                    />
                  </Box>
                </Box>
                {touched.gender && errors.gender && (
                  <Typography color="error" fontSize="12px" whiteSpace="nowrap">
                    {errors.gender}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Birthdate"
                type="date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.birthdate}
                name="birthdate"
                InputLabelProps={{ shrink: true }}
                error={Boolean(touched.birthdate) && Boolean(errors.birthdate)}
                helperText={touched.birthdate && errors.birthdate}
                sx={{ gridColumn: "span 4", mt: "3px" }}
              />

              <InputLabel id="location-lable" sx={{ mb: "-20px" }}>
                Location
              </InputLabel>
              <Select
                name="location"
                displayEmpty
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.location) && Boolean(errors.location)}
                labelId="location-lable"
              >
                <MenuItem value="">Select a location</MenuItem>
                {countriesWithFlags.map((country) => {
                  return (
                    <MenuItem value={country.country} key={country.country}>
                      {country.country} {country.flag}
                    </MenuItem>
                  );
                })}
              </Select>

              {Boolean(touched.location) && Boolean(errors.location) && (
                <Typography
                  color="error"
                  m="-19px 0 -20px 0"
                  fontSize="12px"
                  whiteSpace="nowrap"
                >
                  {errors.location}
                </Typography>
              )}

              {/* -----------------Dropzone1----------------- */}

              <InputLabel sx={{ mb: "-20px" }}>Profile Picture</InputLabel>

              <Box
                border={`2px dashed ${palette.neutral.medium}`}
                padding="10px"
                sx={{
                  gridColumn: "span 4",
                  borderRadius: "4px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <Dropzone
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple={false}
                  onDrop={(acceptedFiles) => {
                    setFieldValue("picturePath", acceptedFiles[0]);
                    setProfileImagePreview(
                      URL.createObjectURL(acceptedFiles[0])
                    );
                    setIsCropperOpen(true);
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <Box {...getRootProps()} padding="1rem">
                      <input {...getInputProps()} />
                      {!values.picturePath ? (
                        <p>Add Profile Picture Here</p>
                      ) : (
                        <FlexBetween position="relative">
                          <Box>
                            <img
                              src={profileImagePreview}
                              alt="preview"
                              style={{
                                height: "100px",
                                width: "100px",
                                objectFit: "cover",
                                maxWidth: "100%",
                                borderRadius: "50%",
                              }}
                            />
                          </Box>

                          <IconButton
                            sx={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              backgroundColor: palette.background.alt,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFieldValue("picturePath", null);
                              setProfileImagePreview(null);
                              setCropComplete(null);
                            }}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </FlexBetween>
                      )}
                    </Box>
                  )}
                </Dropzone>

                {isCropperOpen && (
                  <Box
                    position="fixed"
                    top="0"
                    left="0"
                    width="100vw"
                    height="100vh"
                    bgcolor={palette.background.alt}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex="1000"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Cropper
                      image={profileImagePreview}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, croppedAreaPixels) => {
                        setCropComplete(croppedAreaPixels);
                      }}
                    />

                    <Box
                      display="flex"
                      alignItems="center"
                      width="100%"
                      padding="20px"
                      justifyContent="center"
                      gap="14px"
                      position="fixed"
                      bottom="0"
                      left="0"
                    >
                      <Button
                        onClick={() => {
                          setCropComplete(null);
                          setIsCropperOpen(false);
                        }}
                        sx={{
                          color: palette.neutral.medium,
                          bgcolor: palette.background.alt,
                          width: "140px",
                          border: `1px solid ${palette.neutral.medium}`,
                        }}
                      >
                        cansel
                      </Button>

                      <Button
                        onClick={async () => {
                          if (!cropComplete) return;
                          try {
                            const blob = await cropImage(
                              profileImagePreview,
                              cropComplete
                            );
                            if (blob) {
                              const fileName =
                                values.picturePath?.name || "profile.jpg";
                              const file = new File([blob], fileName, {
                                type: blob.type,
                              });
                              setFieldValue("picturePath", file);
                              setProfileImagePreview(URL.createObjectURL(blob));
                              setCropComplete(null);
                              setIsCropperOpen(false);
                            }
                          } catch (error) {
                            console.error("Error cropping image:", error);
                          }
                        }}
                        sx={{
                          color: "black",
                          bgcolor: palette.primary.main,
                          width: "140px",
                          "&:hover": {
                            color: palette.primary.main,
                            backgroundColor: palette.primary.dark,
                          },
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
              {touched.picturePath && errors.picturePath && (
                <Typography color="error" variant="body2" m="-10px 0 -20px 0">
                  {errors.picturePath}
                </Typography>
              )}

              {/* -----------------Dropzone2----------------- */}
              <InputLabel sx={{ mb: "-20px" }}>Background</InputLabel>

              <Box
                border={`2px dashed ${palette.neutral.medium}`}
                padding="10px"
                sx={{
                  gridColumn: "span 4",
                  borderRadius: "4px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <Dropzone
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple={false}
                  onDrop={(acceptedFiles) => {
                    setFieldValue("background", acceptedFiles[0]);
                    setBackgroundImagePreview(
                      URL.createObjectURL(acceptedFiles[0])
                    );
                    setIsCropperOpen(true);
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <Box {...getRootProps()} padding="1rem">
                      <input {...getInputProps()} />
                      {!values.background ? (
                        <p>Add Background Here</p>
                      ) : (
                        <FlexBetween position="relative">
                          <Box>
                            <img
                              src={backgroundImagePreview}
                              alt="preview"
                              style={{
                                height: "140px",
                                width: "100%",
                                objectFit: "cover",
                                maxWidth: "100%",
                              }}
                            />
                          </Box>

                          <IconButton
                            sx={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              backgroundColor: palette.background.alt,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFieldValue("background", null);
                              setBackgroundImagePreview(null);
                              setCropComplete(null);
                            }}
                          >
                            <DeleteOutline />
                          </IconButton>

                          {isCropperOpen && (
                            <Box
                              position="fixed"
                              top="0"
                              left="0"
                              width="100vw"
                              height="100vh"
                              bgcolor={palette.background.alt}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              zIndex="1000"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Cropper
                                image={backgroundImagePreview}
                                crop={crop}
                                zoom={zoom}
                                aspect={40 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, croppedAreaPixels) => {
                                  setCropComplete(croppedAreaPixels);
                                }}
                              />

                              <Box
                                display="flex"
                                alignItems="center"
                                width="100%"
                                padding="20px"
                                justifyContent="center"
                                gap="14px"
                                position="fixed"
                                bottom="0"
                                left="0"
                              >
                                <Button
                                  onClick={() => {
                                    setCropComplete(null);
                                    setIsCropperOpen(false);
                                  }}
                                  sx={{
                                    color: palette.neutral.medium,
                                    bgcolor: palette.background.alt,
                                    width: "140px",
                                    border: `1px solid ${palette.neutral.medium}`,
                                  }}
                                >
                                  cansel
                                </Button>

                                <Button
                                  onClick={async () => {
                                    if (!cropComplete) return;
                                    try {
                                      const blob = await cropImage(
                                        backgroundImagePreview,
                                        cropComplete
                                      );
                                      if (blob) {
                                        const fileName =
                                          values.background?.name ||
                                          "profile.jpg";
                                        const file = new File(
                                          [blob],
                                          fileName,
                                          {
                                            type: blob.type,
                                          }
                                        );
                                        setFieldValue("background", file);
                                        setBackgroundImagePreview(
                                          URL.createObjectURL(blob)
                                        );
                                        setCropComplete(null);
                                        setIsCropperOpen(false);
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error cropping image:",
                                        error
                                      );
                                    }
                                  }}
                                  sx={{
                                    color: "black",
                                    bgcolor: palette.primary.main,
                                    width: "140px",
                                    "&:hover": {
                                      color: palette.primary.main,
                                      backgroundColor: palette.primary.dark,
                                    },
                                  }}
                                >
                                  Save
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </FlexBetween>
                      )}
                    </Box>
                  )}
                </Dropzone>
              </Box>
              {touched.background && errors.background && (
                <Typography color="error" variant="body2" m="-10px 0 -20px 0">
                  {errors.background}
                </Typography>
              )}

              <TextField
                label={
                  <Box display="flex" alignItems="center" gap="5px">
                    <Facebook />
                    <Typography>Facebook Link</Typography>
                  </Box>
                }
                multiline
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.facebook}
                name="facebook"
                error={Boolean(touched.facebook) && Boolean(errors.facebook)}
                helperText={touched.facebook && errors.facebook}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <TextField
                label={
                  <Box display="flex" alignItems="center" gap="5px">
                    <Instagram />
                    <Typography>Instagram Link</Typography>
                  </Box>
                }
                multiline
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.instagram}
                name="instagram"
                error={Boolean(touched.instagram) && Boolean(errors.instagram)}
                helperText={touched.instagram && errors.instagram}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <TextField
                label={
                  <Box display="flex" alignItems="center" gap="5px">
                    <LinkedIn />
                    <Typography>Linkedin Link</Typography>
                  </Box>
                }
                multiline
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.linkedin}
                name="linkedin"
                error={Boolean(touched.linkedin) && Boolean(errors.linkedin)}
                helperText={touched.linkedin && errors.linkedin}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <TextField
                label={
                  <Box display="flex" alignItems="center" gap="5px">
                    <X />
                    <Typography>Link</Typography>
                  </Box>
                }
                multiline
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.x}
                name="x"
                error={Boolean(touched.x) && Boolean(errors.x)}
                helperText={touched.x && errors.x}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <TextField
                label={
                  <Box display="flex" alignItems="center" gap="5px">
                    <YouTube />
                    <Typography>Youtube Link</Typography>
                  </Box>
                }
                multiline
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.youtube}
                name="youtube"
                error={Boolean(touched.youtube) && Boolean(errors.youtube)}
                helperText={touched.youtube && errors.youtube}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <Typography
                p="6px 9px"
                border="2px solid #858585"
                width="100%"
                borderRadius="4px"
                textAlign="center"
                sx={{
                  userSelect: "none",
                  cursor: "pointer",
                  transition: ".3s",
                  padding: "10px",
                  mt: "7px",
                  "&:hover": {
                    background: mode === "dark" ? "#0000003b" : "#a5a5a578",
                  },
                }}
                onClick={() => {
                  setProfileSettings(false);
                  setChangePassword(true);
                }}
              >
                Change password
              </Typography>

              {/* -----------------Button----------------- */}

              <Button
                fullWidth
                type="submit"
                sx={{
                  padding: "1rem",
                  mt: "7px",
                  backgroundColor: palette.primary.main,
                  color: palette.background.alt,
                  "&:hover": {
                    color: palette.primary.main,
                  },
                }}
                disabled={loading}
              >
                {loading ? "loading..." : "Save"}
              </Button>
            </form>
          );
        }}
      </Formik>
    </TasksComponent>
  );
};

export default ProfileSettings;
