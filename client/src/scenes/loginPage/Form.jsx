import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Radio,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../state";
import Dropzone from "react-dropzone";
import { countriesWithFlags } from "../../../infoArrays";
import { DeleteOutlined } from "@mui/icons-material";
import Cropper from "react-easy-crop";
import { cropImage } from "../../frequentFunctions";

const registerSchema = yup.object().shape({
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
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Password must match")
    .required("Confirm password is required"),
  location: yup.string().required("required"),
  gender: yup.string().required("required"),
  birthdate: yup
    .string()
    .required("required")
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
});

const loginSchema = yup.object().shape({
  username: yup.string().max(20).required("required"),
  password: yup.string().required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  confirmPassword: "",
  location: "",
  picture: "",
  gender: "",
  birthdate: "",
};

const initialValuesLogin = {
  username: "".trim(),
  password: "",
};

const Form = () => {
  const [dataExisted, setDataExisted] = useState({
    username: false,
  });
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [cropComplete, setCropComplete] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  setImagePreview;
  const { palette } = useTheme();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const isNonMobileScreen = useMediaQuery("(min-width: 600px)");

  document.title = "Loop";

  const location = useLocation();

  const register = async (values, onSubmitProps) => {
    setLoading(true);

    try {
      const formData = new FormData();

      for (let value in values) {
        formData.append(value, values[value]);
      }
      formData.append("picturePath", values.picture ? values.picture.name : "");

      const savedUserResponse = await fetch(`/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      const savedUser = await savedUserResponse.json();

      console.log(savedUserResponse)

      if (
        savedUser?.message &&
        savedUser?.message?.includes("This Username Already Exists")
      ) {
        setDataExisted({ username: true });
      } else {
        setDataExisted({ username: false });
      }

      if (savedUser && !savedUser?.message) {
        onSubmitProps.resetForm();
        navigate("/login");
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (values, onSubmitProps) => {
    if (loading) return;

    setLoading(true);
    try {
      const formData = new FormData();

      for (let value in values) {
        formData.append(value, values[value]);
      }

      const loggedInResponse = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const loggedIn = await loggedInResponse.json();

      if (loggedIn && !loggedIn.message) {
        dispatch(
          setLogin({
            user: loggedIn.user,
            token: loggedIn.token,
          })
        );
        onSubmitProps.resetForm();
        navigate("/");
      }

      setLoginError(false);

      if (loggedIn.message) {
        setLoginError(true);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    if (location.pathname === "/login") await login(values, onSubmitProps);
    if (location.pathname === "/signup") await register(values, onSubmitProps);
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={
        location.pathname === "/login"
          ? initialValuesLogin
          : initialValuesRegister
      }
      validationSchema={
        location.pathname === "/login" ? loginSchema : registerSchema
      }
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
        <Box>
          <Typography
            fontSize={isNonMobileScreen ? "30px" : "22px"}
            fontWeight="500"
            textTransform="uppercase"
            textAlign="left"
            sx={{ userSelect: "none" }}
          >
            {location.pathname === "/signup"
              ? "Create your account"
              : "Welcome back"}
          </Typography>

          <Typography
            fontSize={isNonMobileScreen ? "16px" : "14px"}
            mb="16px"
            textAlign="left"
            color={palette.neutral.medium}
            sx={{ userSelect: "none" }}
          >
            {location.pathname === "/signup"
              ? "Please fill in the information below"
              : "Please enter your username and password"}
          </Typography>

          <form onSubmit={handleSubmit}>
            {location.pathname === "/signup" ? (
              <Box
                display="grid"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                gap="10px"
                sx={{
                  "& > div": {
                    gridColumn: isNonMobileScreen ? undefined : "span 4",
                  },
                }}
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
                  error={
                    Boolean(touched.firstName) && Boolean(errors.firstName)
                  }
                  helperText={touched.firstName && errors.firstName}
                  sx={{
                    gridColumn: "span 2",
                  }}
                  className="inputForm"
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
                  className="inputForm"
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
                  className="inputForm"
                />

                {dataExisted.username && (
                  <Typography color="error" fontSize="12px" whiteSpace="nowrap">
                    this username already exists
                  </Typography>
                )}

                <TextField
                  label="Password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  type="password"
                  name="password"
                  error={Boolean(touched.password) && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{
                    gridColumn: "span 4",
                  }}
                  className="inputForm"
                />

                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  error={Boolean(
                    touched.confirmPassword && errors.confirmPassword
                  )}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="password"
                  sx={{
                    gridColumn: "span 4",
                  }}
                  className="inputForm"
                />

                <Box
                  my="10px"
                  sx={{
                    gridColumn: "span 4",
                    borderRadius: "4px",
                    userSelect: "none",
                  }}
                >
                  <Dropzone
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple={false}
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      const fileExtension = file.name
                        .split(".")
                        .pop()
                        .toLowerCase();

                      if (
                        ["jpg", "jpeg", "png", "webp"].includes(fileExtension)
                      ) {
                        setFieldValue("picture", file);
                        setImagePreview(URL.createObjectURL(file));
                        setImageError(null);
                        setIsCropperOpen(true);
                      } else if (
                        !["jpg", "jpeg", "png", "webp"].includes(fileExtension)
                      ) {
                        setImageError("This file is not supported");
                      }
                    }}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <Box
                        {...getRootProps()}
                        padding="1rem"
                        border={
                          !imagePreview
                            ? `2px dashed ${palette.neutral.medium}`
                            : ""
                        }
                        sx={{ cursor: "pointer" }}
                      >
                        <input {...getInputProps()} />
                        {!values.picture ? (
                          <p>Add Picture Here</p>
                        ) : (
                          <Box>
                            <Box position="relative" width="fit-content">
                              <img
                                src={imagePreview}
                                alt="preview"
                                width="110"
                                style={{
                                  height: "110px",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                }}
                              />

                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFieldValue("picture", null);
                                  setImagePreview(null);
                                }}
                                sx={{
                                  position: "absolute",
                                  top: "5px",
                                  right: "5px",
                                  bgcolor: "#00000073",
                                  color: "white",
                                }}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </Box>

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
                                  image={imagePreview}
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
                                          imagePreview,
                                          cropComplete
                                        );
                                        if (blob) {
                                          const fileName =
                                            values.picturePath?.name ||
                                            "profile.jpg";
                                          const file = new File(
                                            [blob],
                                            fileName,
                                            {
                                              type: blob.type,
                                            }
                                          );
                                          setFieldValue("picture", file);
                                          setImagePreview(
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
                          </Box>
                        )}
                      </Box>
                    )}
                  </Dropzone>

                  {imageError && (
                    <Typography
                      color="error"
                      fontSize="12px"
                      whiteSpace="nowrap"
                      mt="5px"
                      mb="-5px"
                    >
                      {imageError}
                    </Typography>
                  )}
                </Box>

                {touched.picture && errors.picture && (
                  <Typography color="error" variant="body2">
                    {errors.picture}
                  </Typography>
                )}

                <Box sx={{ gridColumn: "span 4" }}>
                  <InputLabel sx={{ color: "gray" }}>Gender</InputLabel>

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
                        error={
                          Boolean(touched.gender) && Boolean(errors.gender)
                        }
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
                        error={
                          Boolean(touched.gender) && Boolean(errors.gender)
                        }
                        labelId="gender-label"
                        checked={values.gender === "female" ? true : false}
                      />
                    </Box>
                  </Box>

                  {touched.gender && errors.gender && (
                    <Typography
                      color="error"
                      fontSize="12px"
                      whiteSpace="nowrap"
                    >
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
                  error={
                    Boolean(touched.birthdate) && Boolean(errors.birthdate)
                  }
                  helperText={touched.birthdate && errors.birthdate}
                  sx={{ gridColumn: "span 4", mt: "3px" }}
                />

                <InputLabel id="location-lable" sx={{ color: "gray" }}>
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
                  sx={{
                    gridColumn: "span 4",
                  }}
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
                  <Typography color="error" fontSize="12px" whiteSpace="nowrap">
                    {errors.location}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                gap="10px"
              >
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

                <TextField
                  label="Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password" // name is related to initialValuesRegister
                  error={Boolean(touched.password) && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{
                    gridColumn: "span 4",
                  }}
                />
                {loginError && (
                  <Typography color="error" fontSize="12px" whiteSpace="nowrap">
                    invalid username or password
                  </Typography>
                )}
              </Box>
            )}

            {location.pathname === "/signup" && (
              <Typography
                color={palette.neutral.medium}
                fontSize="11px"
                mt=".75rem"
                mb="-.45rem"
                sx={{ userSelect: "none" }}
              >
                You can change all of your information later
              </Typography>
            )}

            {/* Button */}
            <Box>
              <Button
                fullWidth
                type="submit"
                sx={{
                  padding: "1rem",
                  mt: "1.4rem",
                  borderRadius: "50px",
                  backgroundColor: palette.primary.main,
                  color: palette.background.alt,
                  "&:hover": {
                    color: palette.primary.main,
                  },
                }}
                disabled={loading}
              >
                {loading
                  ? "Loading.."
                  : location.pathname === "/signup"
                  ? "REGISTER"
                  : "Login"}
              </Button>

              <Link
                to={location.pathname === "/signup" ? "/login" : "/signup"}
                reloadDocument
              >
                <Typography
                  color={palette.primary.main}
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    mt: ".6rem",
                    width: "fit-content",
                  }}
                  onClick={() => {
                    resetForm();
                  }}
                >
                  {location.pathname === "/signup"
                    ? "Already have an account? Login here"
                    : "Don't have an account? Sign Up here"}
                </Typography>
              </Link>
            </Box>
          </form>
        </Box>
      )}
    </Formik>
  );
};

export default Form;
