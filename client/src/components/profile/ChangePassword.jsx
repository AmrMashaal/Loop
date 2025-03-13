import { Button, TextField, Typography } from "@mui/material";
import TasksComponent from "../TasksComponent";
import { Formik } from "formik";
import * as yup from "yup";
import { Box } from "@mui/system";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
const ChangePassword = ({ changePassword, setChangePassword }) => {
  const [wrongPass, setWrongPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { palette } = useTheme();

  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const schema = yup.object().shape({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .min(6, "New password must be 6 characters at least")
      .required("New password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword"), null], "Password must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (values, onSubmitProps) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user._id}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const result = await response.json();

      if (result.message === "Wrong password") {
        setWrongPass(true);
      } else {
        setWrongPass(false);
        onSubmitProps.resetForm();
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TasksComponent
      description="change password"
      open={changePassword}
      setOpen={setChangePassword}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box>
              <TextField
                label="Current Password"
                name="currentPassword"
                error={Boolean(
                  touched.currentPassword && errors.currentPassword
                )}
                helperText={touched.currentPassword && errors.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={() => setWrongPass(false)}
                value={values.currentPassword}
                type="password"
                sx={{ width: "100%", mb: "1rem" }}
              />
              {wrongPass && (
                <Typography
                  color="#f44336"
                  fontSize="0.6428571428571428rem"
                  m="-14px 0 1rem 14px"
                >
                  Password is wrong
                </Typography>
              )}
            </Box>
            <Box>
              <TextField
                label="New Password"
                name="newPassword"
                error={Boolean(touched.newPassword && errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.newPassword}
                type="password"
                sx={{ width: "100%", mb: "1rem" }}
              />
            </Box>

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              value={values.confirmPassword}
              error={Boolean(touched.confirmPassword && errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              type="password"
              sx={{ width: "100%", mb: "1rem" }}
            />

            <Button
              fullWidth
              type="submit"
              sx={{
                padding: "1rem",
                mt: ".75rem",
                backgroundColor: palette.primary.main,
                color: palette.background.alt,
                "&:hover": {
                  color: palette.primary.main,
                },
              }}
              onClick={handleSubmit}
            >
              {loading ? "Loading..." : "Submit"}
            </Button>
          </form>
        )}
      </Formik>
    </TasksComponent>
  );
};

export default ChangePassword;
