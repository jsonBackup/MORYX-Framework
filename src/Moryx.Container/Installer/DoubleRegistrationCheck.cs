﻿using System;
using Castle.MicroKernel;

namespace Moryx.Container.Installer
{
    /// <summary>
    /// Class used to check the kernel for an exisiting component registration of this type
    /// </summary>
    public static class DoubleRegistrationCheck
    {
        /// <summary>
        /// Look for an existing component in the kernel
        /// </summary>
        public static bool AllreadyRegistered(IKernel kernel, Type foundComponent, RegistrationAttribute regAtt)
        {
            var name = regAtt == null || string.IsNullOrEmpty(regAtt.Name) ? foundComponent.FullName : regAtt.Name;
            return kernel.HasComponent(name);
        }
    }
}
